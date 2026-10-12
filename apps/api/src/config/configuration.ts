import type { EnvConfig } from './env.validation';

/**
 * Structures the flat, validated env into a namespaced config object.
 * Injected via ConfigService and read as `config.get('jwt.accessTtl')`.
 */
export default function configuration(env: EnvConfig) {
  return {
    app: {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
      corsOrigin: env.CORS_ORIGIN,
      appUrl: env.NEXT_PUBLIC_APP_URL,
    },
    db: {
      uri: env.MONGODB_URI,
    },
    jwt: {
      secret: env.JWT_SECRET,
      accessTtl: env.JWT_ACCESS_TTL,
      refreshSecret: env.JWT_REFRESH_SECRET,
      refreshTtl: env.JWT_REFRESH_TTL,
      cookieSecure: env.COOKIE_SECURE,
    },
    redis: {
      url: env.REDIS_URL,
    },
    storage: {
      driver: env.STORAGE_DRIVER,
      endpoint: env.STORAGE_ENDPOINT,
      bucket: env.STORAGE_BUCKET,
      accessKey: env.STORAGE_ACCESS_KEY,
      secretKey: env.STORAGE_SECRET_KEY,
      publicBaseUrl: env.STORAGE_PUBLIC_BASE_URL,
    },
    payment: {
      provider: env.PAYMENT_PROVIDER,
      secret: env.PAYMENT_SECRET,
      webhookSecret: env.PAYMENT_WEBHOOK_SECRET,
    },
    ai: {
      provider: env.AI_PROVIDER,
      apiKey: env.AI_API_KEY,
    },
    mail: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD,
      from: env.MAIL_FROM,
    },
    sms: {
      provider: env.SMS_PROVIDER,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackUrl: env.GOOGLE_CALLBACK_URL,
    },
    webPush: {
      publicKey: env.WEB_PUSH_PUBLIC_KEY,
      privateKey: env.WEB_PUSH_PRIVATE_KEY,
      contactEmail: env.WEB_PUSH_CONTACT_EMAIL,
    },
    rateLimit: {
      ttlSeconds: env.RATE_LIMIT_TTL_SECONDS,
      max: env.RATE_LIMIT_MAX,
    },
  };
}

export type AppConfig = ReturnType<typeof configuration>;
