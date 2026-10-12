import { z } from 'zod';

export const createReviewSchema = z.object({
  orderId: z.string().min(1),
  ratings: z.object({
    overall: z.number().int().min(1).max(5),
    communication: z.number().int().min(1).max(5).optional(),
    quality: z.number().int().min(1).max(5).optional(),
    timeliness: z.number().int().min(1).max(5).optional(),
    value: z.number().int().min(1).max(5).optional(),
  }),
  comment: z.string().max(1000).optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
