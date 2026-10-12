import type { BaseEntity } from './common';
import type { LedgerEntryType, PaymentStatus } from './enums';

export interface Payment extends BaseEntity {
  orderId: string;
  userId: string;
  provider: string; // 'mock' | 'razorpay' | 'stripe' ...
  providerRef: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  idempotencyKey: string;
  failureReason?: string;
}

export interface LedgerEntry extends BaseEntity {
  orderId?: string;
  paymentId?: string;
  userId?: string;
  type: LedgerEntryType;
  amount: number; // signed: positive = credit to platform/provider ledger row, negative = debit
  currency: string;
  description: string;
  balanceAfter?: number;
}
