# NEEDX Development Guide

> **Version:** 1.0.0 | **Audience:** Core Engineers, Contributors, System Architects

---

## 1. System Architecture & Tech Stack

NEEDX is structured as a high-performance monorepo leveraging **pnpm workspaces** and **Turborepo** for build orchestration and task caching.

### Frontend Application (`apps/web`)
- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Styling:** Tailwind CSS v4 with bespoke CSS variables design tokens (`globals.css`)
- **Typography:** Fraunces (Warm Display serif), Manrope (Modern sans-serif body), IBM Plex Mono (Financial & technical values)
- **UI Components:** Custom components built on top of Radix UI primitives with Lucide icons
- **Server State & Caching:** TanStack Query (React Query) v5
- **Client State:** Zustand (for lightweight UI-only states like drawers and search filters)
- **Form Management:** React Hook Form with `@hookform/resolvers/zod`
- **PWA Infrastructure:** Custom service worker, Web App Manifest, install prompt banner, and offline application shell

### Backend Application (`apps/api`)
- **Framework:** NestJS 11 (Modular Dependency Injection architecture)
- **Database Layer:** MongoDB 7 via Mongoose ODM
- **Real-Time Layer:** Socket.IO with WebSocket and long-polling fallbacks
- **Validation:** 100% Zod-driven schema validation (no `class-validator`)
- **Authentication:** JWT with HttpOnly, SameSite cookies for both access and refresh tokens
- **Rate Limiting:** NestJS Throttler module (default 120 req/min per IP)
- **Audit Logging:** Database-backed audit trail for all significant administrative and state actions

### Shared Packages (`packages/*`)
- **`@needx/types`:** Canonical TypeScript types and shared interfaces. Compiled to native JavaScript (`dist/*.js`) and type declarations (`dist/*.d.ts`) so runtime Node processes can consume them directly.
- **`@needx/validation`:** Centralized Zod schemas acting as the single source of truth for API request payload validation and frontend form validation.
- **`@needx/config`:** Shared TypeScript configuration (`tsconfig.base.json`) and ESLint flat configuration.

---

## 2. Monorepo Directory Layout

```
needx/
├── apps/
│   ├── web/                         # Next.js 16 Frontend App
│   │   ├── public/                  # Static assets, icons, manifest.webmanifest, sw.js
│   │   ├── src/
│   │   │   ├── app/                 # Next.js App Router (pages & nested layouts)
│   │   │   │   ├── admin/           # Admin portal routes
│   │   │   │   ├── dashboard/       # Buyer & User personal dashboard
│   │   │   │   ├── provider/        # Provider portal routes
│   │   │   │   ├── needs/           # Need creation & detail views
│   │   │   │   ├── listings/        # Listing browsing & detail views
│   │   │   │   ├── search/          # Search interface
│   │   │   │   ├── globals.css      # Tailwind v4 theme definitions
│   │   │   │   └── layout.tsx       # Root layout with providers & bottom navigation
│   │   │   ├── components/          # Domain & primitive UI components
│   │   │   ├── hooks/               # TanStack Query & custom React hooks
│   │   │   ├── lib/                 # API clients, utils, socket connection, geo math
│   │   │   └── stores/              # Zustand stores
│   │   └── Dockerfile               # Multi-stage production container for web
│   └── api/                         # NestJS 11 API Backend
│       ├── src/
│       │   ├── common/              # Filters, interceptors, decorators, pipes, providers
│       │   ├── config/              # Zod environment validation & configuration schema
│       │   ├── database/            # Mongoose connection module
│       │   ├── guards/              # JwtAuthGuard, RolesGuard, WsJwtGuard
│       │   ├── middleware/          # RequestId tracking middleware
│       │   ├── modules/             # 21 domain-driven NestJS modules
│       │   ├── seed/                # MongoDB seeding scripts and mock data
│       │   ├── app.module.ts        # Root NestJS application module
│       │   └── main.ts              # Entrypoint bootstrapping HTTP & WebSockets
│       ├── uploads/                 # Local media storage directory
│       └── Dockerfile               # Multi-stage production container for API
├── packages/
│   ├── types/                       # Shared DTO & Wire types
│   ├── validation/                  # Shared Zod schemas
│   └── config/                      # Shared TS and ESLint configs
├── docs/                            # Official Platform Documentation Hub
├── Documentation/                   # Historical Architecture & Design specifications
├── docker-compose.yml               # Local & staging container orchestration
├── turbo.json                       # Turborepo task pipeline configuration
├── pnpm-workspace.yaml              # Workspace directory mappings
├── .env.example                     # Reference environment configuration
└── package.json                     # Monorepo root scripts & dev dependencies
```

---

## 3. Environment Configuration

Copy the example configuration to initialize your local development environment:
```bash
cp .env.example .env
```

### Essential Environment Variables

| Variable | Required? | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Runtime environment mode (`development`, `production`, `test`). |
| `PORT` | Yes | `4000` | Port on which the NestJS API listens. |
| `MONGODB_URI` | **Yes** | `mongodb://localhost:27017/needx` | MongoDB connection string. |
| `JWT_SECRET` | **Yes** | *Min 16 characters random string* | Secret key for signing Access Tokens. |
| `JWT_REFRESH_SECRET` | **Yes** | *Min 16 characters random string* | Secret key for signing Refresh Tokens. |
| `JWT_EXPIRES_IN` | No | `15m` | Lifetime of access tokens. |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Lifetime of refresh tokens. |
| `COOKIE_SECURE` | Yes | `false` | Must be `false` for local HTTP; set `true` in HTTPS production. |
| `CORS_ORIGIN` | Yes | `http://localhost:3000` | Allowed client origin for CORS and cookie delivery. |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis instance for session caching and Socket.IO adapter. |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:4000` | API endpoint consumed by the frontend. |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | Canonical frontend domain for links and PWA metadata. |

### Optional Service Fallbacks
When third-party API credentials are not provided, the API automatically falls back to deterministic dev-mode mock implementations:
- **Payments (`PAYMENT_PROVIDER=mock`):** Enables the simulated checkout flow at `/pay/mock/[ref]` with server-side HMAC-signed webhooks.
- **Email (`SMTP_HOST` unset):** Logs outgoing emails (password resets, notifications) to the API terminal console via `ConsoleEmailProvider`.
- **SMS (`SMS_PROVIDER` unset):** Logs generated OTP codes to the terminal console via `ConsoleSmsProvider`.
- **Storage (`STORAGE_DRIVER=local`):** Persists uploaded files directly to `apps/api/uploads/`.
- **AI Engine (`AI_PROVIDER=none`):** Employs rule-based regex parsing and djb2 feature-hashing embeddings locally without calling external APIs.

---

## 4. Development Workflow & Commands

All development tasks should be executed from the root of the monorepo using `pnpm`:

```bash
# Install all monorepo dependencies
pnpm install

# Start both API (:4000) and Web (:3000) simultaneously via Turborepo
pnpm dev

# Run only the frontend web application
pnpm dev:web

# Run only the backend API server
pnpm dev:api

# Seed MongoDB with realistic test users, categories, listings, and needs
pnpm seed

# Reset database and re-seed from scratch
pnpm --filter @needx/api run seed --reset

# Run full project typechecking (tsc --noEmit)
pnpm typecheck

# Lint all codebases across packages and apps
pnpm lint

# Format codebase using Prettier
pnpm format

# Run all automated test suites
pnpm test

# Build production bundles for all applications and packages
pnpm build
```

---

## 5. Local AI & Semantic Engine

NEEDX features a resilient AI and NLP architecture designed to operate autonomously without mandatory third-party AI keys:

1. **Needs Parser Service (`needs-parser.service.ts`):**
   - Employs optimized regular expressions and keyword extractors tuned to natural phrasing:
     * *Intent & Transaction Mode:* Detects `rent`, `buy`, `borrow`, `hire`, `quote`, `donate`, `exchange`.
     * *Duration & Quantity:* Extracts patterns like `for 2 days`, `for 1 week`, `3 hours`.
     * *Budget Bounds:* Captures currency markers (`₹`, `rs`, `inr`, `under`, `budget`, `below`).
     * *City & Geolocation:* Cross-references known Indian tier-1 and tier-2 city names.
     * *Confidence Score:* Dynamically calculated based on token match density (capped at 0.95).

2. **Feature Hashing Embedding Service (`embedding.service.ts`):**
   - Implements a classic NLP feature-hashing algorithm:
     * Tokenizes incoming text into normalized unigrams and bigrams.
     * Maps tokens into a fixed-dimension vector (default: 64 dimensions) using a 32-bit `djb2` hash.
     * L2-normalizes the resulting vector.
     * Evaluates semantic similarity using **Cosine Similarity**, enabling fast vector matching directly in Node.js without requiring external vector databases.

3. **Keyword Moderation Service (`moderation.service.ts`):**
   - Automatically inspects user-submitted text for restricted goods (weapons, contraband, counterfeit items, hate speech).
   - Flagged content is not silently destroyed; instead, an automated `Report` document is created in the database for human moderator review in the Admin Center.

---

## 6. Coding Standards & Architectural Guidelines

1. **Strict Dependency Order:** Shared logic belongs in `packages/types` or `packages/validation`. Do not import `apps/api` code into `apps/web` or vice-versa.
2. **Guarded State Machines:** Never update status fields (`OrderStatus`, `OfferStatus`) directly from user input. Always route mutations through domain services utilizing the transition validators (`canTransitionOrder`, `canTransitionOffer`).
3. **Double-Entry Financial Principle:** Any financial change must produce an immutable ledger entry. Balance calculations must be derived as aggregate sums over `ledger_entries`.
4. **Idempotency:** Payment checkouts and webhook processing must supply and record idempotency keys to guard against duplicate network retries.
5. **No `class-validator`:** Request body validation in NestJS must exclusively use the global Zod validation pipe (`ZodValidationPipe`).
