# Architecture

## Stack

- **apps/web** — Next.js 16 (App Router, React 19, Turbopack), Tailwind CSS v4, shadcn/ui-style components hand-built on Radix primitives, TanStack Query for server state, Zustand for the small amount of genuine client-only UI state, React Hook Form + Zod for forms.
- **apps/api** — NestJS 11, MongoDB via Mongoose, Socket.IO for realtime messaging, Zod for all request validation (no class-validator), JWT auth via httpOnly cookies.
- **packages/types** — shared wire/DTO contracts. Built to real `dist/*.js` + `.d.ts` (not shipped as raw TypeScript) so the compiled API can `require()` it at runtime, not just during typechecking.
- **packages/validation** — shared Zod schemas; the single source of truth for validation on both ends. Same build treatment as `packages/types`.
- **packages/config** — shared `tsconfig` base and ESLint flat-config base.
- **packages/ui** was deliberately *not* created. Every component currently lives in `apps/web/src/components`. Extracting a cross-package component library adds real Tailwind v4 content-detection and build-graph complexity for negative value at this stage — a reasonable extraction point once there's a second consuming app.

## Monorepo tooling

pnpm workspaces + Turborepo. `turbo.json`'s `build`/`typecheck`/`lint`/`test` tasks all declare `dependsOn: ["^build"]`, so `packages/types` and `packages/validation` always build before anything that imports them — this matters because they compile to real JS (see above), not just for cache correctness.

## The core transaction spine

This is the part that's fully wired end-to-end, with real authorization and
state-machine guards, not just UI:

```
Need (parsed from free text)
  → Matching engine ranks Listings (weighted score, see below)
  → Provider sends an Offer (SENT)
  → Negotiation (VIEWED → COUNTERED* → ACCEPTED | REJECTED | EXPIRED | CANCELLED)
  → Accepted offer → Order created (PENDING)
  → Payment checkout → signed webhook → Order PAID → Ledger entries written
  → Provider CONFIRMED → READY → (buyer/provider) ACTIVE → COMPLETED
  → Review (one per participant per order, enforced by a unique index)
  → [RENT orders only] Rental return → inspection → deposit release
```

Every arrow above is a guarded transition (`*-status.util.ts` in the
relevant module), not a free-form status field the frontend can set. See
`orders/order-status.util.ts` and `offers/offer-status.util.ts` — both are
unit-tested, including the spec's explicit rules ("a cancelled order cannot
become completed", "a rejected/expired offer cannot be accepted").

## The "AI" layer, and why it's not a mock

No `AI_API_KEY` was available while building this (see `ENVIRONMENT.md`).
Rather than fake it, `apps/api/src/modules/ai/` implements the same
functions a real AI integration would expose — `parseNeed`,
`classifyCategory`, `generateEmbedding`, `moderateContent` — using genuinely
real, if simpler, techniques:

- **`needs-parser.service.ts`** — regex + keyword extraction for budget,
  duration, city, transaction mode, and category, tuned against the exact
  example in the product brief ("I need a projector for 2 days in Gurgaon
  under ₹3000"). Confidence is always reported (capped at 0.95) — it never
  claims certainty.
- **`embedding.service.ts`** — the classic **feature-hashing** trick
  (tokenize → djb2 hash into a fixed-size vector → L2-normalize), a real,
  documented lightweight NLP technique, not a placeholder. Cosine similarity
  between these vectors is genuinely used as the "semantic relevance"
  component of the matching score.
- **`moderation.service.ts`** — a narrow keyword screen for clearly
  prohibited categories (weapons, controlled substances, counterfeit goods,
  stolen property), which auto-files a `Report` for human review rather than
  auto-rejecting — matching the project's principle that AI may *recommend*,
  never *decide* irreversible actions.

Every one of these is an injectable service behind a clean interface —
swapping in a real embeddings/completion API call is a localized change,
not a rewrite.

## Matching engine

`matching.service.ts` scores each candidate listing against a need on seven
weighted dimensions (weights live in one place, `matching.config.ts`, and a
unit test asserts they sum to 1):

| Dimension | Weight | How it's computed |
|---|---|---|
| Semantic relevance | 30% | 50% category exact-match + 50% embedding cosine similarity |
| Location | 20% | Haversine distance, linear falloff to 0 at 50km |
| Price | 15% | 1.0 within budget, decaying penalty above `budget.max` |
| Availability | 10% | Listing `ACTIVE` + `quantity > 0` (real date-conflict checking happens as a hard guard at rental-creation time, not just as a ranking hint — see `rentals.service.ts`) |
| Rating | 10% | Provider's average rating, neutral 0.6 for unrated new providers so they aren't buried |
| Reliability | 10% | `1 - cancellationRate` |
| Response rate | 5% | Provider's tracked response rate |

## Money: payments and the ledger

- **Never** `user.balance += amount` anywhere in the codebase. Every
  financial fact is an immutable row in `ledger_entries`
  (`CUSTOMER_PAYMENT`, `PLATFORM_FEE`, `PROVIDER_PAYABLE`, `REFUND`,
  `DEPOSIT`, `DEPOSIT_RELEASE`, `PENALTY`, `ADJUSTMENT`, `PAYOUT`). A
  "balance" is a `SUM()` computed on read.
- Client-reported payment success is **never** trusted. The only thing that
  marks a payment `SUCCEEDED` is a webhook whose HMAC signature is verified
  server-side — including in dev mode, where `/pay/mock/[ref]`'s "Simulate
  Success" button triggers the exact same signed-webhook code path a real
  gateway's server-to-server callback would.
- Webhooks are idempotent: each `Payment` document tracks `processedEventIds`,
  so a duplicated delivery can never double-write ledger entries.
- `idempotencyKey` on checkout (`order:<id>`) means re-clicking "Pay" never
  creates a second payment intent for the same order.

## Known simplifications (and why)

Documented here rather than silently shipped, per the project's own
"make a sensible engineering decision, document it" instruction:

- **OpenAPI/Swagger** was not wired up. Adding it cleanly alongside a
  Zod-only validation strategy (rather than class-validator, which
  `@nestjs/swagger` is built around) needed either a second parallel DTO
  layer or a `zod-to-openapi` dependency — more machinery than the
  time budget justified. Endpoints are documented in prose in this file and
  discoverable directly from each `*.controller.ts`.
- **Refresh-token revocation** isn't implemented — logout clears cookies
  client-side but doesn't blacklist the still-valid refresh token
  server-side. `REDIS_URL` is already provisioned for exactly this.
- **Roles are additive, not exclusive.** The spec lists `USER, PROVIDER,
  BUSINESS, MODERATOR, ADMIN, SUPER_ADMIN` as if a user has one role; in
  practice almost everyone on a real marketplace is both a need-poster and
  (optionally) a provider, so `User.roles` is an array — a fresh signup
  gets `[USER]` and gains `PROVIDER`/`BUSINESS` on top when they opt in via
  Settings.
- **Admin ban status isn't visible in the users table** — `PublicUser`
  intentionally excludes `isBanned` from the wire type since it's not safe
  to show to the public-facing `/users/:id` endpoint, and the admin list
  reuses the same mapper. A separate `AdminUserView` type that includes it
  is the natural fix.
- **Provider "reviews moderation" and "broadcast notifications"** admin
  pages describe what's already structurally possible (reviews can be
  reported like anything else; the `Notification` model supports it) rather
  than shipping speculative UI for workflows that don't exist yet.
- **E2E browser tests** (Playwright, the spec's four flows) were not
  written. The test suite that exists is real unit tests (state machines,
  matching math, the parser, and 13 Zod schema tests) plus one API
  integration smoke test (`test/app.e2e-spec.ts`) — see `README.md` for
  exactly what's been run and verified versus what needs a live MongoDB to
  execute.
- **No frontend component/unit tests.** `apps/web`'s `pnpm test` is
  honestly a no-op rather than a fake-green script — component testing
  (React Testing Library / Vitest) for the highest-value pieces (the
  need-parser preview card, the offer negotiation state in `OfferCard`) is
  the natural next addition.

## Directory map

```
needx/
├── apps/
│   ├── web/src/
│   │   ├── app/            Next.js App Router pages (route = folder)
│   │   ├── components/     ui/ (primitives) + one folder per domain
│   │   ├── hooks/          TanStack Query hooks, one file per domain
│   │   ├── lib/            api-client.ts, api/*.ts, utils.ts, socket.ts
│   │   └── stores/         Zustand — deliberately tiny, see hooks for server state
│   └── api/src/
│       ├── modules/        one folder per domain: schema(s), service, controller, module
│       ├── common/         filters, interceptors, pipes, decorators, provider interfaces
│       ├── guards/         JwtAuthGuard (global), RolesGuard (global), WsJwtGuard
│       └── config/         Zod-validated env, namespaced config object
├── packages/
│   ├── types/               shared wire types — builds to real dist/
│   ├── validation/          shared Zod schemas — builds to real dist/
│   └── config/               shared tsconfig + eslint base
├── docker-compose.yml
├── .env.example
└── ENVIRONMENT.md            what every env var does and its dev-mode fallback
```
