import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async listForAdmin(params: {
    page: number;
    limit: number;
    type?: LedgerEntryType;
    orderId?: string;
    userId?: string;
    search?: string;
  }) {
    const filter: Record<string, any> = {};
    if (params.type) {
      filter.type = params.type;
    }
    if (params.orderId) {
      filter.orderId = Types.ObjectId.isValid(params.orderId)
        ? new Types.ObjectId(params.orderId)
        : params.orderId;
    }
    if (params.userId) {
      filter.userId = Types.ObjectId.isValid(params.userId)
        ? new Types.ObjectId(params.userId)
        : params.userId;
    }
    if (params.search && params.search.trim()) {
      filter.description = { $regex: params.search.trim(), $options: 'i' };
    }

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }

  async getAdminSummary() {
    const [aggregations, totalEntries] = await Promise.all([
      this.model.aggregate<{ _id: string; totalAmount: number; count: number }>([
        {
          $group: {
            _id: '$type',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      this.model.countDocuments().exec(),
    ]);

    const statsMap: Record<string, { totalAmount: number; count: number }> = {};
    for (const row of aggregations) {
      statsMap[row._id] = { totalAmount: row.totalAmount, count: row.count };
    }

    const platformRevenue = statsMap['PLATFORM_FEE']?.totalAmount ?? 0;
    const grossVolume = statsMap['CUSTOMER_PAYMENT']?.totalAmount ?? 0;
    const providerPayables = statsMap['PROVIDER_PAYABLE']?.totalAmount ?? 0;
    const depositsHeld = (statsMap['DEPOSIT']?.totalAmount ?? 0) - (statsMap['DEPOSIT_RELEASE']?.totalAmount ?? 0);
    const refundsTotal = Math.abs(statsMap['REFUND']?.totalAmount ?? 0);
    const payoutsTotal = Math.abs(statsMap['PAYOUT']?.totalAmount ?? 0);

    return {
      platformRevenue,
      grossVolume,
      providerPayables,
      depositsHeld: Math.max(0, depositsHeld),
      refundsTotal,
      payoutsTotal,
      totalEntries,
      breakdown: statsMap,
    };
  }

  async platformRevenueTotal(): Promise<number> {
    const result = await this.model.aggregate([
      { $match: { type: 'PLATFORM_FEE' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }
}
