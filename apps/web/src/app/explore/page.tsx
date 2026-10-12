'use client';

import { useNeedSearch } from '@/hooks/use-needs';
import { useListingSearch } from '@/hooks/use-listings';
import { NeedCard } from '@/components/needs/need-card';
import { ListingCard } from '@/components/listings/listing-card';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { Inbox, PackageSearch, MapPin } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useUserLocation } from '@/contexts/location-context';
import { LocationSelector } from '@/components/layout/location-selector';

export default function ExplorePage() {
  const { location, getDistanceTo } = useUserLocation();
  const { data: needs, isLoading: needsLoading } = useNeedSearch({ page: 1 });
  const { data: listings, isLoading: listingsLoading } = useListingSearch({
    sort: 'newest',
    lat: location.radiusKm > 0 ? location.lat : undefined,
    lng: location.radiusKm > 0 ? location.lng : undefined,
    radiusKm: location.radiusKm > 0 ? location.radiusKm : undefined,
    limit: 6,
  });

  const radiusLabel = location.radiusKm === 0 ? 'All India' : `Within ${location.radiusKm} km`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Explore</h1>
          <p className="mt-1 text-sm text-ink-soft">See what people need nearby, and what providers are offering.</p>
        </div>

        <div className="flex items-center gap-2">
          <LocationSelector variant="navbar" />
        </div>
      </div>

      {/* Active Location Banner */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-trust/20 bg-trust/5 px-4 py-2.5 text-xs text-ink">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-trust" />
          <span>
            Showing verified results <strong>{radiusLabel}</strong> of <strong>{location.addressLabel}</strong>
          </span>
        </div>
        <LocationSelector variant="compact" />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Nearby needs</h2>
          <Link href="/needs/new" className="flex items-center gap-1 text-sm font-medium text-hope hover:underline">
            Post your own <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {needsLoading ? (
          <CardGridSkeleton count={3} />
        ) : !needs || needs.data.length === 0 ? (
          <EmptyState icon={Inbox} title="No open needs yet" description="Be the first to post what you're looking for." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {needs.data.map((need) => (
              <NeedCard key={need.id} need={need} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Recommended listings</h2>
          <Link href="/listings" className="flex items-center gap-1 text-sm font-medium text-trust hover:underline">
            Browse all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {listingsLoading ? (
          <CardGridSkeleton count={6} />
        ) : !listings || listings.data.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No listings yet" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.data.map((listing) => {
              const distanceKm = getDistanceTo(
                listing.location?.point?.coordinates?.[1],
                listing.location?.point?.coordinates?.[0]
              );
              return <ListingCard key={listing.id} listing={listing} distanceKm={distanceKm} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
}
