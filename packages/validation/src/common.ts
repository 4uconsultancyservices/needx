import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  cursor: z.string().optional(),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const geoPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
});

export const locationInputSchema = z.object({
  point: geoPointSchema,
  label: z.string().min(2).max(120),
  city: z.string().max(80).optional(),
  state: z.string().max(80).optional(),
});

export const budgetSchema = z
  .object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    currency: z.string().length(3).default('INR'),
  })
  .refine((b) => b.min === undefined || b.max === undefined || b.min <= b.max, {
    message: 'budget.min cannot exceed budget.max',
    path: ['min'],
  });

export const dateRangeSchema = z
  .object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  })
  .refine((d) => !d.start || !d.end || new Date(d.start) <= new Date(d.end), {
    message: 'dateRange.start must be before dateRange.end',
    path: ['start'],
  });
