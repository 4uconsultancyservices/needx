import type { BaseEntity } from './common';
import type { TransactionMode } from './enums';

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface CustomerPreferences {
  preferredCategories: string[];
  preferredModes: TransactionMode[];
  searchRadiusKm: number;
  currency: string;
  budgetTier?: 'ECONOMY' | 'STANDARD' | 'PREMIUM';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    whatsapp: boolean;
  };
}

export interface BuyerMetrics {
  totalNeedsPosted: number;
  totalOrdersPlaced: number;
  totalAmountSpent: number;
  activeNeedsCount: number;
  averageOrderValue: number;
  fulfillmentRate: number; // 0..1
}

export interface CustomerKyc {
  status: KycStatus;
  documentType?: 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'VOTER_ID';
  idNumberMasked?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface CustomerLoyalty {
  tier: LoyaltyTier;
  points: number;
  lifetimePoints: number;
}

export interface CustomerProfile extends BaseEntity {
  userId: string;
  preferences: CustomerPreferences;
  buyerMetrics: BuyerMetrics;
  kyc: CustomerKyc;
  loyalty: CustomerLoyalty;
  customerTags: string[]; // e.g. 'VIP', 'HIGH_VALUE', 'EARLY_ADOPTER'
  internalNotes?: string;
}
