import { z } from 'zod';
import { REPORT_REASONS, REPORT_TARGET_TYPES } from '@needx/types';

export const createReportSchema = z.object({
  targetType: z.enum(REPORT_TARGET_TYPES),
  targetId: z.string().min(1),
  reason: z.enum(REPORT_REASONS),
  details: z.string().max(2000).optional(),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;

export const createDisputeSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(3).max(200),
  details: z.string().min(10).max(4000),
  evidenceUrls: z.array(z.string().url()).max(10).optional().default([]),
});
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;

export const resolveDisputeSchema = z.object({
  status: z.enum(['RESOLVED_BUYER', 'RESOLVED_PROVIDER', 'RESOLVED_SPLIT', 'CLOSED']),
  resolutionNote: z.string().min(3).max(2000),
});
