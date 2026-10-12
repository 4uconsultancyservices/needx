'use client';

import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import { useListingSearch } from '@/hooks/use-listings';
import { useNeedSearch } from '@/hooks/use-needs';
import { ListingCard } from '@/components/listings/listing-card';
import { NeedCard } from '@/components/needs/need-card';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { SearchX } from 'lucide-react';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q);
  const { data: listings, isLoading: listingsLoading } = useListingSearch({ q: debouncedQ || undefined });
  const { data: needs, isLoading: needsLoading } = useNeedSearch({ q: debouncedQ || undefined });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 animate-fade-up">
      <div className="text-center sm:text-left">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Search NEEDX</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Find products to rent or buy, services to hire, or active community needs to fulfill.
        </p>
      </div>

      <div className="relative mt-6">
        <SearchIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-hope" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for gear, services, or community needs..."
          className="h-14 pl-12 pr-4 text-base rounded-2xl border-border bg-surface shadow-sm focus-visible:ring-hope"
          autoFocus
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-ink-faint">Popular searches:</span>
        {['Projector', 'Photography', 'Electrician', 'Study table', 'Cordless drill'].map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => setQ(term)}
            className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-soft hover:border-hope/40 hover:text-hope hover:bg-hope-soft/30 transition-all cursor-pointer"
          >
            {term}
          </button>
        ))}
      </div>

      <Tabs defaultValue="listings" className="mt-6">
        <TabsList>
          <TabsTrigger value="listings">Listings {listings ? `(${listings.meta.total ?? listings.data.length})` : ''}</TabsTrigger>
          <TabsTrigger value="needs">Needs {needs ? `(${needs.meta.total ?? needs.data.length})` : ''}</TabsTrigger>
        </TabsList>
        <TabsContent value="listings">
          {listingsLoading ? (
            <CardGridSkeleton count={4} />
          ) : !listings || listings.data.length === 0 ? (
            <EmptyState icon={SearchX} title="No listings found" description={q ? `Nothing matched "${q}".` : 'Start typing to search.'} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {listings.data.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="needs">
          {needsLoading ? (
            <CardGridSkeleton count={4} />
          ) : !needs || needs.data.length === 0 ? (
            <EmptyState icon={SearchX} title="No needs found" description={q ? `Nothing matched "${q}".` : 'Start typing to search.'} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {needs.data.map((n) => (
                <NeedCard key={n.id} need={n} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
