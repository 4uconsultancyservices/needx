import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { LedgerEntryType } from '@needx/types';
import { LedgerEntry } from './schemas/ledger-entry.schema';

const PLATFORM_FEE_RATE = 0.1; // 10% take rate — configurable in one place

export interface RecordEntryInput {
  orderId?: string;
  paymentId?: string;
  userId?: string;
  type: LedgerEntryType;
  amount: number;
  currency?: string;
  description: string;
}

@Injectable()
export class LedgerService {
  constructor(@InjectModel(LedgerEntry.name) private readonly model: Model<LedgerEntry>) {}

  async record(input: RecordEntryInput): Promise<LedgerEntry> {
    return this.model.create({ ...input, currency: input.currency ?? 'INR' });
  }

  /** Standard 3-entry pattern fired once a payment succeeds. */
  async recordPaymentSuccess(params: {
    orderId: string;
    paymentId: string;
    buyerId: string;
    providerId: string;
    amount: number;
    depositAmount?: number;
    currency: string;
  }): Promise<void> {
    const fee = Math.round(params.amount * PLATFORM_FEE_RATE * 100) / 100;
    const payable = Math.round((params.amount - fee) * 100) / 100;

    await Promise.all([
      this.record({
        orderId: params.orderId,
        paymentId: params.paymentId,
        userId: params.buyerId,
        type: 'CUSTOMER_PAYMENT',
        amount: params.amount,
        currency: params.currency,
        description: 'Customer payment received',
      }),
      this.record({
        orderId: params.orderId,
        paymentId: params.paymentId,
        type: 'PLATFORM_FEE',
        amount: fee,
        currency: params.currency,
        description: `Platform fee (${(PLATFORM_FEE_RATE * 100).toFixed(0)}%)`,
      }),
      this.record({
        orderId: params.orderId,
        paymentId: params.paymentId,
        userId: params.providerId,
        type: 'PROVIDER_PAYABLE',
        amount: payable,
        currency: params.currency,
        description: 'Amount payable to provider',
      }),
      ...(params.depositAmount
        ? [
            this.record({
              orderId: params.orderId,
              paymentId: params.paymentId,
              userId: params.buyerId,
              type: 'DEPOSIT' as LedgerEntryType,
              amount: params.depositAmount,
              currency: params.currency,
              description: 'Refundable deposit held',
            }),
          ]
        : []),
    ]);
  }

  async recordRefund(params: { orderId: string; userId: string; amount: number; currency: string; reason: string }) {
    return this.record({
      orderId: params.orderId,
      userId: params.userId,
      type: 'REFUND',
      amount: -Math.abs(params.amount),
      currency: params.currency,
      description: params.reason,
    });
  }

  async recordDepositRelease(params: { orderId: string; userId: string; amount: number; currency: string }) {
    return this.record({
      orderId: params.orderId,
      userId: params.userId,
      type: 'DEPOSIT_RELEASE',
      amount: params.amount,
      currency: params.currency,
      description: 'Deposit released after inspection',
    });
  }

  async recordPenalty(params: { orderId: string; userId: string; amount: number; currency: string; description: string }) {
    return this.record({ ...params, type: 'PENALTY' });
  }

  async recordPayout(params: { userId: string; amount: number; currency: string; description: string }) {
    return this.record({ ...params, type: 'PAYOUT' });
  }

  async balanceForUser(userId: string): Promise<number> {
    const result = await this.model.aggregate([
      { $match: { userId: userId as unknown as object } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async listForUser(userId: string, page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.model.find({ userId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments({ userId }).exec(),
    ]);
    return { items, total };
  }

  async platformRevenueTotal(): Promise<number> {
    const result = await this.model.aggregate([
      { $match: { type: 'PLATFORM_FEE' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }
}
