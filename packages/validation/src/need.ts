import { z } from 'zod';
import { TRANSACTION_MODES } from '@needx/types';
import { budgetSchema, dateRangeSchema, locationInputSchema } from './common';

export const parseNeedInputSchema = z.object({
  text: z.string().min(4, 'Tell us a little more about what you need').max(500),
  locationHint: locationInputSchema.optional(),
});
export type ParseNeedInput = z.infer<typeof parseNeedInputSchema>;

export const createNeedSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().max(2000).default(''),
  categoryId: z.string().optional(),
  modes: z.array(z.enum(TRANSACTION_MODES)).min(1, 'Pick at least one transaction mode'),
  budget: budgetSchema.optional(),
  quantity: z.number().int().min(1).max(9999).optional().default(1),
  dateRange: dateRangeSchema.optional(),
  location: locationInputSchema,
  attributes: z.record(z.string(), z.unknown()).optional().default({}),
  rawInput: z.string().max(500).optional(),
  parseSource: z.enum(['RULE_BASED', 'AI', 'MANUAL']).optional().default('MANUAL'),
});
export type CreateNeedInput = z.infer<typeof createNeedSchema>;

export const updateNeedSchema = createNeedSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'MATCHING', 'FULFILLED', 'EXPIRED', 'CANCELLED']).optional(),
});
export type UpdateNeedInput = z.infer<typeof updateNeedSchema>;

export const needSearchQuerySchema = z.object({
  q: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  city: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
