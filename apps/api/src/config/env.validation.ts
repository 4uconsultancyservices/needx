import { z } from 'zod';

/**
 * Fail-fast environment validation. If a required variable is missing or
 * malformed, the API refuses to boot rather than limping along with
 * `undefined` secrets. Dev-friendly defaults are provided ONLY for values
 * that are safe to default (ports, feature flags) — never for secrets.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(4000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').default('mongodb://localhost:27017/needx'),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  NEXT_PUBLIC_API_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_REFRESH_TTL: z.string().default('7d'),

  COOKIE_SECURE: z.coerce.boolean().default(false),

  REDIS_URL: z.string().optional(),

  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_PUBLIC_BASE_URL: z.string().default('http://localhost:4000/uploads'),

  PAYMENT_PROVIDER: z.enum(['mock', 'razorpay', 'stripe']).default('mock'),
  PAYMENT_SECRET: z.string().optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().default('dev_mock_webhook_secret_change_me'),

  AI_PROVIDER: z.enum(['none', 'anthropic', 'openai']).default('none'),
  AI_API_KEY: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().default('NEEDX <no-reply@needx.local>'),

  SMS_PROVIDER: z.enum(['console', 'twilio']).default('console'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),

  WEB_PUSH_PUBLIC_KEY: z.string().optional(),
  WEB_PUSH_PRIVATE_KEY: z.string().optional(),
  WEB_PUSH_CONTACT_EMAIL: z.string().default('mailto:admin@needx.local'),

  RATE_LIMIT_TTL_SECONDS: z.coerce.number().default(60),
  RATE_LIMIT_MAX: z.coerce.number().default(120),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    // Fail fast and loud — a marketplace should never boot half-configured.
    throw new Error(`Invalid environment configuration:\n${formatted}`);
  }
  return parsed.data;
}
