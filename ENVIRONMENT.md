# Environment configuration

This file explains every variable in `.env.example` — what it does, whether
it's required, and exactly what happens if you leave it unset. Nothing in
this codebase silently pretends a missing credential is configured; every
optional integration has an explicit, working dev-mode fallback.

## Required — the API will not boot without these

| Variable | What it's for |
|---|---|
| `MONGODB_URI` | Connection string for MongoDB. Defaults to `mongodb://localhost:27017/needx`, which works with the bundled `docker-compose.yml`. |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Sign access/refresh tokens. **Generate real random values** — `openssl rand -hex 32` — before running anything beyond a quick local smoke test. Env validation (`apps/api/src/config/env.validation.ts`) refuses to boot if either is under 16 characters. |

Everything else has a safe default or a working fallback provider.

## Optional integrations and their dev-mode fallbacks

NEEDX was built with **no real third-party credentials available** — per
the original project brief, secrets are never invented. Every integration
below is written as an interface with a pluggable implementation
(`common/providers/*` and `modules/payments/providers/*`), bound to a
functional dev-mode default. Swapping to a real provider means implementing
the interface and changing one `useClass` binding — nothing else in the
codebase changes.

| Integration | Env vars | Without them | With them |
|---|---|---|---|
| **Payments** | `PAYMENT_PROVIDER`, `PAYMENT_WEBHOOK_SECRET` | `mock` provider: a real checkout page at `/pay/mock/[ref]`, a real HMAC-signed webhook, real idempotency handling — the entire payment *pipeline* is exercised, just against a fake gateway instead of Razorpay/Stripe. | Implement `PaymentProvider` (see `payment-provider.interface.ts`) for a real gateway and rebind in `payments.module.ts`. |
| **Email** | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` | `ConsoleEmailProvider` logs the full email (verification links, password resets) to the API's stdout. Check the terminal running `pnpm dev:api`. | Implement `EmailProvider` and rebind in `providers.module.ts`. |
| **SMS / OTP** | `SMS_PROVIDER` | `ConsoleSmsProvider` logs the OTP code to stdout the same way. | Implement `SmsProvider` similarly. |
| **File storage** | `STORAGE_DRIVER`, `STORAGE_*` | Writes to `apps/api/uploads/`, served statically at `STORAGE_PUBLIC_BASE_URL`. Fine for local dev, not for a multi-instance deployment. | Set `STORAGE_DRIVER=s3` and implement `StorageProvider` for S3/R2/etc. |
| **Google login** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | The passport strategy still registers (so the module graph boots), but `/auth/google` returns a clear error instead of crashing the app. | Create OAuth credentials in Google Cloud Console and set both values. |
| **Web push** | `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY` | Push notifications are silently skipped (in-app notifications still work fully). | Run `pnpm --filter @needx/api run vapid:generate` and paste the output in — this is a **real, working** integration once keys exist, not a mock; VAPID keys have no external account tied to them so generating your own is the normal setup step, not a fabricated credential. |
| **AI-powered parsing** | `AI_PROVIDER`, `AI_API_KEY` | The need-parser, category classifier, and semantic-relevance scoring all run on a local rule-based parser + a feature-hashing embedding model — see `apps/api/src/modules/ai/`. This is the *primary* path, not a degraded fallback; the app is designed to work fully with `AI_PROVIDER=none`. | The AI module's interfaces (`NeedsParserService`, `EmbeddingService`) are the seam to swap in a real LLM/embeddings API call. |

## Cookies and CORS

`COOKIE_SECURE=false` is correct for local HTTP development. Set it to
`true` before deploying behind HTTPS — browsers silently drop `Secure`
cookies over plain HTTP, which would otherwise look like "login doesn't
work" with no clear error.

`CORS_ORIGIN` must exactly match the origin the browser sees the web app
running on. If you deploy the frontend to a custom domain, update this or
auth cookies set via cross-origin requests will be rejected.

## Redis

`REDIS_URL` is provisioned in `docker-compose.yml` and validated in env
config, but no code path uses it yet. It's the natural next step for:
refresh-token revocation/blacklisting (see the note in `auth.module.ts`),
and horizontally scaling Socket.IO across multiple API instances via the
[socket.io-redis-adapter](https://github.com/socketio/socket.io-redis-adapter)
(see the comment in `messages/realtime.bus.ts`).
