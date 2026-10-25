import { z } from 'zod';
import { ROLES, STAFF_DEPARTMENTS } from '@needx/types';

export const createStaffInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  department: z.enum(STAFF_DEPARTMENTS),
  designation: z.string().min(2, 'Designation must be at least 2 characters').max(100),
  role: z.enum(['STAFF', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']),
  permissions: z.array(z.string()).default([]),
  assignedQueues: z.array(z.string()).optional(),
});
export type CreateStaffInput = z.infer<typeof createStaffInputSchema>;

export const createStaffUserInputSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  city: z.string().optional(),
  department: z.enum(STAFF_DEPARTMENTS),
  designation: z.string().min(2, 'Designation must be at least 2 characters').max(100),
  role: z.enum(['STAFF', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']),
  permissions: z.array(z.string()).default([]),
  assignedQueues: z.array(z.string()).optional(),
});
export type CreateStaffUserInput = z.infer<typeof createStaffUserInputSchema>;

export const updateStaffInputSchema = createStaffInputSchema.partial().extend({
  isSuspended: z.boolean().optional(),
});
export type UpdateStaffInput = z.infer<typeof updateStaffInputSchema>;

