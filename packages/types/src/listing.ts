import type { BaseEntity, LocationInfo } from './common';
import type { ListingStatus, ListingType, PriceUnit, TransactionMode } from './enums';

export interface ListingPrice {
  amount: number;
  currency: string;
  unit?: PriceUnit;
}

export type DamageProtectionPlan = 'NONE' | 'STANDARD' | 'PREMIUM';
export type ConditionGrade = 'BRAND_NEW' | 'LIKE_NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR';
export type CancellationPolicy = 'FLEXIBLE' | 'MODERATE' | 'STRICT';
export type HandoverOption = 'LOCAL_PICKUP' | 'DOORSTEP_DELIVERY' | 'SHIPPING';
export type GalleryImageTag = 'FRONT' | 'BACK' | 'SIDE' | 'ACCESSORIES' | 'DEFECT_DETAIL' | 'IN_USE';

export interface ListingGalleryItem {
  url: string;
  caption?: string;
  isCover?: boolean;
  tag?: GalleryImageTag;
}

export interface ListingProtection {
  securityDeposit?: number; // Refundable deposit held in escrow
  replacementValue?: number; // Fair item replacement value if lost/destroyed/stolen
  damageProtectionPlan?: DamageProtectionPlan;
  coversAccidentalDamage?: boolean; // Covers drops, cracked screens, accidental damage
  coversTheftWithFIR?: boolean; // Covers verified police FIR theft & loss
  coversMechanicalBreakdown?: boolean; // Covers normal operation functional breakdown
  deductiblePercent?: number; // e.g. 10% deductible on claim
  inspectionRequired?: boolean; // Mandatory timestamped photo check-in / check-out
  idVerificationRequired?: boolean; // Only verified KYC / Govt ID seekers can book
  damageClaimProtocol?: string; // e.g. 24h reporting window with photos
}

export interface ListingSpecification {
  brand?: string;
  model?: string;
  yearOrAge?: string;
  conditionGrade?: ConditionGrade;
  conditionNotes?: string;
  serialNumberProtected?: boolean; // Serial/IMEI recorded for anti-swap and recovery
  includedAccessories?: string[];
  dimensionsOrSize?: string;
  weight?: string;
  customSpecs?: Record<string, string>;
}

export interface ListingRentalTerms {
  minRentalDays?: number;
  maxRentalDays?: number;
  cancellationPolicy?: CancellationPolicy;
  handoverOptions?: HandoverOption[];
  deliveryFee?: number;
  lateFeePerDay?: number;
  usageGuidelines?: string;
}

export interface Listing extends BaseEntity {
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  type: ListingType;
  modes: TransactionMode[];
  price: ListingPrice;
  deposit?: number;
  quantity: number;
  condition?: string;
  images: string[];
  location: LocationInfo;
  attributes: Record<string, unknown>;
  status: ListingStatus;
  viewCount?: number;
  favoriteCount?: number;

  // Rich extensions
  protection?: ListingProtection;
  specifications?: ListingSpecification;
  rentalTerms?: ListingRentalTerms;
  gallery?: ListingGalleryItem[];
}
