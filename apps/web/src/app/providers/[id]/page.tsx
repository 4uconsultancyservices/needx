'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PublicUser } from '@needx/types';
import { useReviewsForUser } from '@/hooks/use-misc';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars } from '@/components/shared/rating-stars';
import { ProviderBadges } from '@/components/providers/provider-badges';
import { ProviderIdentitySentinel } from '@/components/providers/provider-identity-sentinel';
import { ProviderActiveListings } from '@/components/providers/provider-active-listings';
import { EmptyState } from '@/components/shared/empty-state';
import { ProviderCardSkeleton } from '@/components/shared/loading-skeletons';
import { Button } from '@/components/ui/button';
import { initials, formatRelativeTime } from '@/lib/utils';
import {
  Star,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Search,
  Home,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

function isValidHexId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

function useProvider(id: string) {
  const isValid = isValidHexId(id);
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => api.get<PublicUser>(`/users/${id}`),
    enabled: isValid,
    retry: false,
  });
}

export default function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isValid = isValidHexId(id);
  const { data: provider, isLoading, isError } = useProvider(id);
  const { data: reviews } = useReviewsForUser(isValid ? id : '');

  // 1. Invalid or Corrupted ID fallback state
  if (!isValid) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        <div className="card-surface border-2 border-amber-500/20 p-8 text-center sm:p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <AlertTriangle className="size-8" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold text-ink">
            Invalid Provider Profile Link
          </h1>
          <p className="mx-auto mt-2.5 max-w-md text-sm text-ink-soft">
            The profile link you clicked contains an invalid or malformed identifier:
            <code className="mt-2 block rounded-md bg-canvas-alt px-3 py-1.5 font-mono text-xs text-rose-600 break-all">
              {decodeURIComponent(id)}
            </code>
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs text-ink-faint">
            This issue has been resolved in the marketplace. Please return to the listings catalog to explore verified providers with authentic identities.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/explore">
                <Search className="mr-2 size-4" />
                Browse Marketplace
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 size-4" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <ProviderCardSkeleton />
      </div>
    );
  }

  // 3. Not Found or Server Error state
  if (isError || !provider) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        <div className="card-surface p-8 text-center sm:p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-canvas-alt text-ink-faint">
            <AlertTriangle className="size-8" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold text-ink">Provider Not Found</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            This provider profile could not be located or may have been deactivated by the platform.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/explore">
                <ArrowLeft className="mr-2 size-4" />
                Back to Marketplace
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = provider.provider?.businessName || provider.name;
  const memberSince = provider.createdAt
    ? new Date(provider.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8">
      {/* Back Breadcrumb */}
      <div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          Back to Listings & Providers
        </Link>
      </div>

      {/* Profile Header Hero Card */}
      <div className="card-surface relative overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
          {/* Avatar with Status */}
          <div className="relative shrink-0">
            <Avatar className="size-24 sm:size-28 ring-4 ring-trust/20 shadow-md">
              <AvatarImage src={provider.avatarUrl} alt={displayName} />
              <AvatarFallback className="text-2xl font-semibold bg-trust/10 text-trust">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>
            {provider.trust?.identityVerified && (
              <div
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-trust text-white shadow-sm ring-2 ring-canvas"
                title="Verified Real Identity"
              >
                <CheckCircle2 className="size-4.5" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
                  {displayName}
                </h1>
                {provider.provider?.businessName && provider.name !== provider.provider.businessName && (
                  <p className="text-xs text-ink-soft">Operated by {provider.name}</p>
                )}
              </div>

              {/* Verified Provider Badge Pill */}
              <div className="self-center sm:self-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-trust/10 px-3.5 py-1 text-xs font-semibold text-trust border border-trust/25 shadow-sm">
                  <ShieldCheck className="size-4" />
                  Verified Real Provider
                </span>
              </div>
            </div>

            {/* Location & Member Since */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-4 text-xs text-ink-soft sm:justify-start">
              {provider.city && (
                <span className="flex items-center gap-1 font-medium text-ink">
                  <MapPin className="size-3.5 text-trust" />
                  Based in {provider.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5 text-ink-faint" />
                Member since {memberSince}
              </span>
              <div className="flex items-center gap-1.5">
                <RatingStars value={provider.trust.ratingAverage} count={provider.trust.ratingCount} size="sm" />
                <span className="font-semibold text-ink">
                  {provider.trust.ratingAverage.toFixed(1)}
                </span>
                <span className="text-ink-faint">({provider.trust.ratingCount} reviews)</span>
              </div>
            </div>

            {/* Provider Feature Badges */}
            <div className="mt-4 flex flex-wrap justify-center gap-2.5 sm:justify-start">
              <ProviderBadges trust={provider.trust} />
            </div>

            {/* Provider Description */}
            {provider.provider?.description && (
              <p className="mt-4 text-sm text-ink-soft leading-relaxed max-w-2xl">
                {provider.provider.description}
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border pt-6 text-center">
          <div className="rounded-xl bg-canvas/60 p-3">
            <p className="font-display text-2xl font-bold text-ink">
              {provider.trust.completedTransactions}
            </p>
            <p className="text-xs text-ink-faint mt-0.5">Completed Deals</p>
          </div>
          <div className="rounded-xl bg-canvas/60 p-3">
            <p className="font-display text-2xl font-bold text-trust">
              {Math.round(provider.trust.responseRate * 100)}%
            </p>
            <p className="text-xs text-ink-faint mt-0.5">Response Rate</p>
          </div>
          <div className="rounded-xl bg-canvas/60 p-3">
            <p className="font-display text-2xl font-bold text-ink">
              {provider.trust.ratingAverage.toFixed(1)} <span className="text-xs text-amber-500">★</span>
            </p>
            <p className="text-xs text-ink-faint mt-0.5">Average Rating</p>
          </div>
          <div className="rounded-xl bg-canvas/60 p-3">
            <p className="font-display text-2xl font-bold text-hope">
              {Math.round((provider.trust.cancellationRate || 0) * 100)}%
            </p>
            <p className="text-xs text-ink-faint mt-0.5">Low Cancellation</p>
          </div>
        </div>
      </div>

      {/* REAL USER & IDENTITY VERIFICATION SENTINEL */}
      <ProviderIdentitySentinel
        userId={provider.id}
        userName={displayName}
        trust={provider.trust}
        provider={provider.provider}
        isBanned={provider.isBanned}
      />

      {/* PROVIDER'S ACTIVE LISTINGS PORTFOLIO */}
      <ProviderActiveListings
        providerId={provider.id}
        providerName={displayName}
      />

      {/* CUSTOMER REVIEWS SECTION */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              Verified Client Reviews {reviews && `(${reviews.total})`}
            </h2>
            <p className="text-xs text-ink-soft">
              Real feedback submitted by seekers following completed transactions
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {!reviews || reviews.items.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No customer reviews yet"
              description="Customer reviews and ratings appear automatically when orders are fulfilled and inspected."
            />
          ) : (
            reviews.items.map((r) => (
              <div key={r.id} className="card-surface p-5 border border-border/80 transition-shadow hover:shadow-card-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RatingStars value={r.ratings.overall} />
                    <span className="text-xs font-semibold text-ink">
                      {r.ratings.overall.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <span className="text-xs text-ink-faint">{formatRelativeTime(r.createdAt)}</span>
                </div>
                {r.comment && <p className="mt-3 text-sm text-ink-soft leading-relaxed">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
