import Link from 'next/link';
import { Package, ShieldCheck } from 'lucide-react';
import type { Listing } from '@needx/types';
import { Badge } from '@/components/ui/badge';
import { PriceDisplay } from '@/components/shared/price-display';
import { LocationDisplay } from '@/components/shared/location-display';
import { TRANSACTION_MODE_LABELS } from '@/lib/utils';

export function ListingCard({ listing, distanceKm }: { listing: Listing; distanceKm?: number }) {
  const coverImage =
    listing.gallery?.find((g) => g.isCover)?.url ??
    listing.gallery?.[0]?.url ??
    listing.images[0];

  const deposit = listing.protection?.securityDeposit ?? listing.deposit;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="card-surface group flex flex-col overflow-hidden rounded-2xl border border-border transition-all hover:border-trust/40 hover:shadow-card-hover"
    >
      <div className="relative flex h-44 items-center justify-center bg-canvas-alt overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Package className="size-10 text-ink-faint/60" />
        )}

        {/* Top Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {listing.modes.slice(0, 2).map((mode) => (
            <Badge key={mode} variant="trust" className="backdrop-blur-md bg-surface/90 text-[10px] font-bold text-trust shadow-xs">
              {TRANSACTION_MODE_LABELS[mode]}
            </Badge>
          ))}
          {listing.condition && (
            <Badge variant="outline" className="backdrop-blur-md bg-surface/90 text-[10px] text-ink font-semibold">
              {listing.condition}
            </Badge>
          )}
        </div>

        {/* Protection Shield Indicator */}
        {(listing.protection?.damageProtectionPlan || deposit) && (
          <div className="absolute right-2.5 top-2.5">
            <span
              className="inline-flex items-center gap-1 rounded-full bg-trust/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-xs"
              title="Protected by NEEDX Escrow & Damage Shield"
            >
              <ShieldCheck className="size-2.5" />
              Shield
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 font-semibold text-sm text-ink group-hover:text-trust transition-colors">
          {listing.title}
        </h3>
        <p className="line-clamp-2 text-xs text-ink-soft">{listing.description}</p>

        <div className="mt-auto pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
          <div>
            <PriceDisplay amount={listing.price.amount} currency={listing.price.currency} unit={listing.price.unit} />
            {deposit ? (
              <span className="block text-[10px] text-ink-faint">
                + ₹{deposit.toLocaleString('en-IN')} escrow deposit
              </span>
            ) : null}
          </div>
          <LocationDisplay label={listing.location.city ?? listing.location.label} distanceKm={distanceKm} />
        </div>
      </div>
    </Link>
  );
}
