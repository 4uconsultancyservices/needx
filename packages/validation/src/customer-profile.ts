import { z } from 'zod';
import { TRANSACTION_MODES } from '@needx/types';

export const updateCustomerPreferencesSchema = z.object({
  preferredCategories: z.array(z.string()).optional(),
  preferredModes: z.array(z.enum(TRANSACTION_MODES)).optional(),
  searchRadiusKm: z.number().min(1).max(200).optional(),
  currency: z.string().length(3).optional(),
  budgetTier: z.enum(['ECONOMY', 'STANDARD', 'PREMIUM']).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
      whatsapp: z.boolean().optional(),
    })
    .optional(),
});
export type UpdateCustomerPreferencesInput = z.infer<typeof updateCustomerPreferencesSchema>;

export const adminUpdateCustomerProfileSchema = z.object({
  customerTags: z.array(z.string()).optional(),
  internalNotes: z.string().max(2000).optional(),
  kycStatus: z.enum(['NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED']).optional(),
  kycRejectionReason: z.string().max(500).optional(),
  loyaltyPointsDelta: z.number().int().optional(),
});
export type AdminUpdateCustomerProfileInput = z.infer<typeof adminUpdateCustomerProfileSchema>;
