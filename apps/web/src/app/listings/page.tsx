'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useListingSearch } from '@/hooks/use-listings';
import { useCategories } from '@/hooks/use-categories';
import { useDebounce } from '@/hooks/use-debounce';
import { ListingCard } from '@/components/listings/listing-card';
import { FilterDrawer, type ListingFilters } from '@/components/listings/filter-drawer';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { Input } from '@/components/ui/input';
import { PackageSearch } from 'lucide-react';

import { useUserLocation } from '@/contexts/location-context';
import { LocationSelector } from '@/components/layout/location-selector';
import { MapPin } from 'lucide-react';

export default function ListingsPage() {
  const { location, getDistanceTo } = useUserLocation();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ListingFilters>({});
  const debouncedQ = useDebounce(q);
  const { data: categories = [] } = useCategories();

  const { data, isLoading } = useListingSearch({
    q: debouncedQ || undefined,
    categoryId: filters.categoryId,
    mode: filters.mode as never,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    lat: location.radiusKm > 0 ? location.lat : undefined,
    lng: location.radiusKm > 0 ? location.lng : undefined,
    radiusKm: location.radiusKm > 0 ? location.radiusKm : undefined,
    sort: filters.sort,
    page,
    limit: 12,
  });

  const radiusLabel = location.radiusKm === 0 ? 'All India' : `Within ${location.radiusKm} km`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Browse listings</h1>
          <p className="mt-1 text-sm text-ink-soft">Products, rentals, and services from providers near you.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LocationSelector variant="navbar" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search listings..." className="w-48 sm:w-56 pl-9" />
          </div>
          <FilterDrawer categories={categories} filters={filters} onApply={(f) => { setFilters(f); setPage(1); }} />
        </div>
      </div>

      {/* Active Location Info Pill */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2 text-xs text-ink-soft">
        <div className="flex items-center gap-2">
          <MapPin className="size-3.5 text-trust" />
          <span>
            Filtering by location: <strong className="text-ink">{location.cityName}</strong> ({radiusLabel})
          </span>
        </div>
        <LocationSelector variant="compact" />
      </div>

      <div className="mt-6">
        {isLoading ? (
          <CardGridSkeleton count={9} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No listings found" description="Try widening your distance radius or clearing filters." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((listing) => {
                const distanceKm = getDistanceTo(
                  listing.location?.point?.coordinates?.[1],
                  listing.location?.point?.coordinates?.[0]
                );
                return <ListingCard key={listing.id} listing={listing} distanceKm={distanceKm} />;
              })}
            </div>
            <div className="mt-6">
              <Pagination page={page} hasMore={data.meta.hasMore} onPageChange={setPage} total={data.meta.total} limit={data.meta.limit} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
