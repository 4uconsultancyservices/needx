import { z } from 'zod';

export const categoryAttributeDefSchema = z.object({
  key: z.string().min(1).max(60),
  label: z.string().min(1).max(80),
  type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'MULTISELECT', 'BOOLEAN']),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  unit: z.string().max(20).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase, alphanumeric, and hyphen-only'),
  icon: z.string().max(60).optional(),
  description: z.string().max(500).optional(),
  parentId: z.string().nullable().optional(),
  keywords: z.array(z.string().min(1).max(40)).default([]),
  attributes: z.array(categoryAttributeDefSchema).default([]),
  sortOrder: z.number().int().default(0),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
