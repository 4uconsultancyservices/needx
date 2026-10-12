import { z } from 'zod';
import { PROVIDER_TYPES } from '@needx/types';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().max(80).optional(),
  avatarUrl: z.string().url().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const becomeProviderSchema = z.object({
  providerType: z.enum(PROVIDER_TYPES),
  businessName: z.string().max(140).optional(),
  description: z.string().max(1000).optional(),
  serviceCategories: z.array(z.string()).max(20).optional().default([]),
});
export type BecomeProviderInput = z.infer<typeof becomeProviderSchema>;
