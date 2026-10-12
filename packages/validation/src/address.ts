import { z } from 'zod';
import { geoPointSchema } from './common';

export const createAddressSchema = z.object({
  label: z.string().min(1).max(40),
  line1: z.string().min(3).max(140),
  line2: z.string().max(140).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  postalCode: z.string().min(3).max(12),
  country: z.string().min(2).max(56).default('India'),
  location: geoPointSchema,
  isDefault: z.boolean().optional().default(false),
});
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
