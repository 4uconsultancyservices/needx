import type { BaseEntity } from './common';
import type { OfferStatus, TransactionMode } from './enums';

export interface OfferHistoryEntry {
  id: string;
  actorId: string;
  action: 'SENT' | 'VIEWED' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  price?: number;
  message?: string;
  at: string;
}

export interface Offer extends BaseEntity {
  needId: string;
  providerId: string;
  listingId?: string;
  mode: TransactionMode;
  price: number;
  deposit?: number;
  deliveryFee?: number;
  currency: string;
  message?: string;
  availability?: string;
  expiresAt?: string;
  status: OfferStatus;
  history: OfferHistoryEntry[];
}
