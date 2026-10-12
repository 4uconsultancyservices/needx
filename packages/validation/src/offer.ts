import { z } from 'zod';
import { TRANSACTION_MODES } from '@needx/types';

export const createOfferSchema = z.object({
  needId: z.string().min(1),
  listingId: z.string().optional(),
  mode: z.enum(TRANSACTION_MODES),
  price: z.number().min(0),
  deposit: z.number().min(0).optional(),
  deliveryFee: z.number().min(0).optional(),
  currency: z.string().length(3).default('INR'),
  message: z.string().max(1000).optional(),
  availability: z.string().max(200).optional(),
  expiresInHours: z.number().int().min(1).max(24 * 14).optional().default(72),
});
export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const counterOfferSchema = z.object({
  price: z.number().min(0),
  message: z.string().max(1000).optional(),
});
export type CounterOfferInput = z.infer<typeof counterOfferSchema>;

export const respondOfferSchema = z.object({
  message: z.string().max(1000).optional(),
});
