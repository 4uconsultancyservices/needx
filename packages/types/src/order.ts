import type { BaseEntity } from './common';
import type { OrderStatus, OrderType } from './enums';

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  at: string;
  actorId?: string;
  note?: string;
}

export interface Order extends BaseEntity {
  needId?: string;
  offerId?: string;
  listingId?: string;
  buyerId: string;
  providerId: string;
  type: OrderType;
  status: OrderStatus;
  amount: number;
  depositAmount?: number;
  deliveryFee?: number;
  currency: string;
  quantity: number;
  statusHistory: OrderStatusHistoryEntry[];
}

export interface Rental extends BaseEntity {
  orderId: string;
  startDate: string;
  endDate: string;
  returnedAt?: string;
  deposit: number;
  lateFeePerDay?: number;
  damageFee?: number;
  inspectionNotes?: string;
  inspectionPassed?: boolean;
  depositReleasedAt?: string;
}
