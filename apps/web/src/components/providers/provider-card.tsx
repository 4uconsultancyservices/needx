'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  User as UserIcon,
} from 'lucide-react';
import type { PublicUser } from '@needx/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars } from '@/components/shared/rating-stars';
import { ProviderBadges } from './provider-badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { initials } from '@/lib/utils';

interface ProviderCardProps {
  provider: PublicUser;
  variant?: 'grid' | 'compact' | 'list';
  distanceKm?: number;
}

export function ProviderCard({ provider, variant = 'grid', distanceKm }: ProviderCardProps) {
  const isBusiness = provider.provider?.providerType === 'BUSINESS';
  const displayName = provider.provider?.businessName || provider.name;
  const categories = provider.provider?.serviceCategories ?? [];
  const completedCount = provider.trust?.completedTransactions ?? 0;
  const rating = provider.trust?.ratingAverage ?? 0;
  const ratingCount = provider.trust?.ratingCount ?? 0;
  const isVerified =
    provider.trust?.identityVerified ||
    provider.trust?.businessVerified ||
    (provider.trust?.emailVerified && provider.trust?.phoneVerified);

  if (variant === 'compact') {
    return (
      <Link
        href={`/providers/${provider.id}`}
        className="group flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-hope/40 hover:shadow-card-hover"
      >
        <div className="relative">
          <Avatar className="size-12 ring-2 ring-border/60 transition-transform group-hover:scale-105">
            <AvatarImage src={provider.avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-canvas-alt font-display text-xs font-semibold text-ink">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-surface text-trust shadow-xs">
              <CheckCircle2 className="size-3.5 fill-trust text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-medium text-ink group-hover:text-hope-deep transition-colors">
              {displayName}
            </p>
            {isBusiness && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                Business
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <RatingStars value={rating} count={ratingCount} size="sm" />
            {provider.city && (
              <span className="flex items-center gap-0.5 text-xs text-ink-faint">
                <MapPin className="size-3" />
                {provider.city}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-hope/30 hover:shadow-card-hover">
      <div>
        {/* Top Header: Avatar + Identity + Badge */}
        <div className="flex items-start gap-4">
          <Link href={`/providers/${provider.id}`} className="relative shrink-0">
            <Avatar className="size-14 ring-2 ring-border/80 transition-transform duration-200 group-hover:scale-105">
              <AvatarImage src={provider.avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-hope-soft font-display text-sm font-semibold text-hope-deep">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>
            {isVerified && (
              <div
                className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-white text-trust shadow-xs"
                title="Verified Identity"
              >
                <CheckCircle2 className="size-4 fill-trust text-white" />
              </div>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={`/providers/${provider.id}`}
                className="truncate font-display text-base font-semibold text-ink hover:text-hope-deep transition-colors"
              >
                {displayName}
              </Link>
            </div>

            {provider.provider?.businessName && provider.provider.businessName !== provider.name && (
              <p className="text-xs text-ink-soft truncate flex items-center gap-1 mt-0.5">
                <UserIcon className="size-3 text-ink-faint" />
                {provider.name}
              </p>
            )}

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <RatingStars value={rating} count={ratingCount} size="sm" />
              <span className="text-xs text-ink-faint">·</span>
              <span className="text-xs font-semibold text-ink-soft">
                {rating > 0 ? rating.toFixed(1) : 'New'}
              </span>
              {ratingCount > 0 && (
                <span className="text-xs text-ink-faint">({ratingCount})</span>
              )}
            </div>
          </div>
        </div>

        {/* Location & Response Metadata */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
          {provider.city && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 text-trust" />
              {provider.city}
              {distanceKm !== undefined && (
                <span className="text-ink-faint">({distanceKm.toFixed(1)} km)</span>
              )}
            </span>
          )}

          {completedCount > 0 && (
            <span className="flex items-center gap-1 font-mono-num">
              <Briefcase className="size-3.5 text-faith-deep" />
              {completedCount} orders completed
            </span>
          )}

          {provider.trust?.avgResponseMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 text-ink-faint" />
              ~{provider.trust.avgResponseMinutes}m reply
            </span>
          )}
        </div>

        {/* Provider Trust Badges */}
        {provider.trust && (
          <div className="mt-3">
            <ProviderBadges trust={provider.trust} className="flex flex-wrap gap-1.5" />
          </div>
        )}

        {/* Bio / Description */}
        {(provider.provider?.description || provider.bio) && (
          <p className="mt-3 text-xs leading-relaxed text-ink-soft line-clamp-2">
            {provider.provider?.description || provider.bio}
          </p>
        )}

        {/* Service Categories */}
        {categories.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-canvas-alt px-2.5 py-0.5 text-[11px] font-medium text-ink-soft border border-border/60"
              >
                {cat}
              </span>
            ))}
            {categories.length > 3 && (
              <span className="rounded-full bg-canvas-alt px-2 py-0.5 text-[10px] text-ink-faint">
                +{categories.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold gap-1.5 hover:border-hope/40 hover:text-hope-deep">
          <Link href={`/providers/${provider.id}`}>
            View Profile
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
