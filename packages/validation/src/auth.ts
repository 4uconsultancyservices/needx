import { z } from 'zod';

// Deliberately conservative: 10-15 chars, at least one letter and one number.
// (Real-world password policy — no arbitrary character-class theater.)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[a-zA-Z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: passwordSchema,
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number')
    .optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});

export const requestOtpSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  code: z.string().length(6),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10),
});
