import { z } from 'zod';
import { LISTING_TYPES, PRICE_UNITS, TRANSACTION_MODES } from '@needx/types';
import { locationInputSchema } from './common';

export const listingPriceSchema = z.object({
  amount: z.number().min(0),
  currency: z.string().length(3).default('INR'),
  unit: z.enum(PRICE_UNITS).optional(),
});

export const listingGalleryItemSchema = z.object({
  url: z.string().min(1),
  caption: z.string().max(120).optional(),
  isCover: z.boolean().optional(),
  tag: z.enum(['FRONT', 'BACK', 'SIDE', 'ACCESSORIES', 'DEFECT_DETAIL', 'IN_USE']).optional(),
});

export const listingProtectionSchema = z.object({
  securityDeposit: z.number().min(0).optional(),
  replacementValue: z.number().min(0).optional(),
  damageProtectionPlan: z.enum(['NONE', 'STANDARD', 'PREMIUM']).optional(),
  coversAccidentalDamage: z.boolean().optional(),
  coversTheftWithFIR: z.boolean().optional(),
  coversMechanicalBreakdown: z.boolean().optional(),
  deductiblePercent: z.number().min(0).max(100).optional(),
  inspectionRequired: z.boolean().optional(),
  idVerificationRequired: z.boolean().optional(),
  damageClaimProtocol: z.string().max(1000).optional(),
});

export const listingSpecificationSchema = z.object({
  brand: z.string().max(80).optional(),
  model: z.string().max(80).optional(),
  yearOrAge: z.string().max(40).optional(),
  conditionGrade: z.enum(['BRAND_NEW', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'FAIR']).optional(),
  conditionNotes: z.string().max(1000).optional(),
  serialNumberProtected: z.boolean().optional(),
  includedAccessories: z.array(z.string().max(80)).optional(),
  dimensionsOrSize: z.string().max(80).optional(),
  weight: z.string().max(40).optional(),
  customSpecs: z.record(z.string(), z.string()).optional(),
});

export const listingRentalTermsSchema = z.object({
  minRentalDays: z.number().int().min(1).max(365).optional(),
  maxRentalDays: z.number().int().min(1).max(365).optional(),
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT']).optional(),
  handoverOptions: z.array(z.enum(['LOCAL_PICKUP', 'DOORSTEP_DELIVERY', 'SHIPPING'])).optional(),
  deliveryFee: z.number().min(0).optional(),
  lateFeePerDay: z.number().min(0).optional(),
  usageGuidelines: z.string().max(2000).optional(),
});

export const createListingSchema = z.object({
  categoryId: z.string().min(1, 'Choose a category'),
  title: z.string().min(3).max(140),
  description: z.string().min(10).max(4000),
  type: z.enum(LISTING_TYPES),
  modes: z.array(z.enum(TRANSACTION_MODES)).min(1),
  price: listingPriceSchema,
  deposit: z.number().min(0).optional(),
  quantity: z.number().int().min(0).max(999999).default(1),
  condition: z.string().max(60).optional(),
  images: z.array(z.string().min(1)).max(20).default([]),
  location: locationInputSchema,
  attributes: z.record(z.string(), z.unknown()).optional().default({}),

  // Extended options
  protection: listingProtectionSchema.optional(),
  specifications: listingSpecificationSchema.optional(),
  rentalTerms: listingRentalTermsSchema.optional(),
  gallery: z.array(listingGalleryItemSchema).max(20).optional().default([]),
});
export type CreateListingInput = z.infer<typeof createListingSchema>;

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'SOLD', 'ARCHIVED']).optional(),
});
export type UpdateListingInput = z.infer<typeof updateListingSchema>;

export const listingSearchQuerySchema = z.object({
  q: z.string().max(200).optional(),
  providerId: z.string().optional(),
  categoryId: z.string().optional(),
  mode: z.enum(TRANSACTION_MODES).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(0.1).max(200).optional(),
  condition: z.string().optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'distance']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
export type ListingSearchQuery = z.infer<typeof listingSearchQuerySchema>;
