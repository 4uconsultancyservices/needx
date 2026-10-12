# NEEDX Implementation Roadmap

> **Created:** 2026-10-10 | **Version:** 1.1 | **Status:** Actively Executing

---

## Overview

This roadmap prioritizes work by: user-facing impact, blocking dependencies, and implementation complexity.

**Current progress:** ~57% complete by verified implementation depth.  
**Goal:** Production-ready, mobile-first marketplace with all critical flows working end-to-end.

---

## Sprint 1 — Critical Fixes — ✅ COMPLETED

These were bugs or gaps that broke the user experience or mobile ergonomics.

### S1.1 — Fix PWA Install Banner Position — ✅ COMPLETED
- **Priority:** Critical
- **File:** [`apps/web/src/components/shared/install-pwa.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/components/shared/install-pwa.tsx)
- **Change:** Positioned with `bottom-24 z-40` and `backdrop-blur-md` on mobile so it never collides with the fixed bottom navigation.
- **Acceptance:** PWA banner floats cleanly above the bottom navigation bar without overlapping icons.

### S1.2 — Add Route Auth Guards — ✅ COMPLETED
- **Priority:** High
- **Files:** [`apps/web/src/components/shared/auth-guard.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/components/shared/auth-guard.tsx), [`dashboard/layout.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/app/dashboard/layout.tsx), [`provider/layout.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/app/provider/layout.tsx), [`admin/layout.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/app/admin/layout.tsx)
- **Change:** Created a reusable client-side `AuthGuard` with role protection (`PROVIDER`, `ADMIN`) and redirect to `/login?next=...`.
- **Acceptance:** Unauthenticated users are redirected from protected shells.

### S1.3 — Fix ListingCard Image Component — ✅ COMPLETED
- **Priority:** Medium
- **File:** [`apps/web/src/components/listings/listing-card.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/components/listings/listing-card.tsx)
- **Change:** Replaced unoptimized `<img>` with Next.js `<Image fill sizes="..." />`.
- **Acceptance:** Images are lazily loaded and responsive.

### S1.4 — Fix TrustSection Icon Size — ✅ COMPLETED
- **Priority:** Low
- **File:** [`apps/web/src/components/home/trust-section.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/components/home/trust-section.tsx)
- **Change:** Replaced non-standard `size-4.5` class with `size-[18px]`.
- **Acceptance:** Standard Tailwind sizing applied.

### S1.5 — Fix Admin Page Type Warnings — ✅ COMPLETED
- **Priority:** Low
- **Files:** [`admin/disputes/page.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/app/admin/disputes/page.tsx), [`admin/moderation/page.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/app/admin/moderation/page.tsx), [`admin/reports/page.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/app/admin/reports/page.tsx)
- **Change:** Replaced `any` types with explicit TypeScript interfaces.
- **Acceptance:** ESLint reports 0 errors and 0 warnings across the web app.

---

## Sprint 2 — Seed Data & API Connectivity — ✅ COMPLETED

### S2.1 — Run Seed Data Script — ✅ COMPLETED
- **Priority:** Critical
- **File:** `apps/api/src/seed/seed.ts`
- **Result:** Populated MongoDB with 14 categories, 12 users, 8 listings, 5 needs, sample offers, orders, and reviews.
- **Dev Credentials:** Password `Needx@12345` for all seeded accounts (`admin@needx.local`, `aarav.provider@needx.local`, `ananya@needx.local`).

### S2.2 — Verify API & DB Connection — ✅ COMPLETED
- **Priority:** Critical
- **Files:** `.env`, `apps/api/.env`, `apps/web/.env.local`
- **Result:** Local MongoDB (port 27017) and NestJS API server (port 4000) operational. Frontend rewrites to API tested and responding.

---

## Sprint 3 — UI Enhancement — 🟡 IN PROGRESS

### S3.1 — Redesign Hero Section
- **Priority:** High
- **File:** [`apps/web/src/components/home/hero.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/components/home/hero.tsx)
- **Status:** Enhanced with mobile badge, responsive typography, and interactive need input.

### S3.2 — Mobile Category Grid Polish
- **Priority:** High
- **File:** [`apps/web/src/components/home/category-grid.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/components/home/category-grid.tsx)
- **Status:** Verified live with 14 categories and custom icons.

### S3.3 — Add "Active Community Needs" Section — ✅ COMPLETED
- **Priority:** High
- **Files:** [`apps/web/src/components/home/need-section.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/components/home/need-section.tsx), [`apps/web/src/app/page.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/app/page.tsx)
- **Result:** Live section showing seeded active needs with price, location, and mode badges.

### S3.4 — Provider CTA Contrast & Ergonomics — ✅ COMPLETED
- **Priority:** High
- **File:** [`apps/web/src/components/home/provider-cta.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/components/home/provider-cta.tsx)
- **Result:** Replaced low-contrast classes with dark navy gradient and high-contrast typography.

### S3.5 — Improve Search Page
- **Priority:** High
- **File:** [`apps/web/src/app/search/page.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/app/search/page.tsx)
- **Change:** Add category filter pills, mode filters, and search suggestions.

---

## Sprint 4 — Authentication Improvements (1 day)

### S4.1 — Provider Route Auth Guard — ✅ COMPLETED
- **File:** [`apps/web/src/app/provider/layout.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/app/provider/layout.tsx)
- **Result:** Enforces `PROVIDER` role with upgrade prompt.

### S4.2 — Admin Route Auth Guard — ✅ COMPLETED
- **File:** [`apps/web/src/app/admin/layout.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/app/admin/layout.tsx)
- **Result:** Enforces `ADMIN` / `SUPER_ADMIN` role with access restriction.

### S4.3 — Improve Register Page
- **File:** [`apps/web/src/app/register/page.tsx`](file:///d:/Development/4ucs/needx/apps/web/src/app/register/page.tsx)

---

## Sprint 5 — Core Workflow Verification (2–3 days)

### S5.1 — Verify Need Creation Flow
- **Flow:** Input need text -> AI parse -> Preview -> Edit -> Post -> Confirm

### S5.2 — Verify Provider Offer Flow
- **Flow:** Provider sees needs -> Creates offer -> Buyer receives notification -> Offer viewed

### S5.3 — Verify Messaging System
- **Flow:** User sends message -> Real-time delivery -> Persistent in DB

### S5.4 — Verify Order Flow
- **Flow:** Offer accepted -> Order created -> Status transitions -> Completion

---

## Sprint 6 — Testing & Production Hardening

- Frontend unit tests with Vitest
- API Integration tests
- E2E Playwright test for critical post-need flow
- Index optimization & audit
