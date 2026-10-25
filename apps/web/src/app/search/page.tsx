'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PackageSearch,
  RotateCcw,
  Search as SearchIcon,
  SearchX,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { TransactionMode } from '@needx/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import { useListingSearch } from '@/hooks/use-listings';
import { useNeedSearch } from '@/hooks/use-needs';
import { useCategories } from '@/hooks/use-categories';
import { ListingCard } from '@/components/listings/listing-card';
import { NeedCard } from '@/components/needs/need-card';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import {
  SearchFilterSidebar,
  type SearchFilters,
} from '@/components/search/search-filter-sidebar';

const POPULAR_SEARCHES = ['Projector', 'Photography', 'Electrician', 'Study table', 'Cordless drill', 'Tents'];

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial values from URL
  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || undefined;
  const initialMode = searchParams.get('mode') || undefined;
  const initialMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const initialMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const initialSort = (searchParams.get('sort') as SearchFilters['sort']) || 'relevance';
  const initialTab = searchParams.get('tab') || 'listings';

  const [q, setQ] = useState(initialQ);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: initialCategory,
    mode: initialMode,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    sort: initialSort,
  });

  const debouncedQ = useDebounce(q, 300);
  const { data: categories = [] } = useCategories();

  // Calculate matching category ID if category is slug
  const matchedCategoryId = useMemo(() => {
    if (!filters.category) return undefined;
    const found = categories.find((c) => c.slug === filters.category || c.id === filters.category);
    return found ? found.id : filters.category;
  }, [categories, filters.category]);

  // Fetch Listings with filters
  const { data: listings, isLoading: listingsLoading } = useListingSearch({
    q: debouncedQ || undefined,
    categoryId: matchedCategoryId,
    mode: filters.mode as TransactionMode | undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
  });

  // Fetch Needs with filters
  const { data: needs, isLoading: needsLoading } = useNeedSearch({
    q: debouncedQ || undefined,
    categoryId: matchedCategoryId,
  });

  // Keep URL in sync with state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (filters.category) params.set('category', filters.category);
    if (filters.mode) params.set('mode', filters.mode);
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort);
    if (activeTab !== 'listings') params.set('tab', activeTab);

    const queryString = params.toString();
    const targetUrl = queryString ? `/search?${queryString}` : '/search';
    router.replace(targetUrl, { scroll: false });
  }, [debouncedQ, filters, activeTab, router]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.mode) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.sort && filters.sort !== 'relevance') count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      category: undefined,
      mode: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sort: 'relevance',
    });
  };

  const handleClearAll = () => {
    setQ('');
    handleResetFilters();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 animate-fade-up">
      {/* Top Header */}
      <div className="text-center sm:text-left">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Search NEEDX</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Find products to rent or buy, certified services to hire, or active community needs to fulfill.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="relative mt-6">
        <SearchIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-hope" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for gear, services, or community needs..."
          className="h-14 pl-12 pr-12 text-base rounded-2xl border-border bg-surface shadow-sm focus-visible:ring-hope"
          autoFocus
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink cursor-pointer"
            aria-label="Clear search input"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Popular Search Suggestions */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-ink-faint">Popular:</span>
        {POPULAR_SEARCHES.map((term) => (
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

      {/* Horizontal Category Carousel Pills */}
      {categories.length > 0 && (
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilters({ ...filters, category: undefined })}
            className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              !filters.category
                ? 'bg-trust text-white shadow-xs'
                : 'border border-border/80 bg-surface text-ink-soft hover:bg-canvas-alt hover:text-ink'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = filters.category === cat.slug || filters.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setFilters({
                    ...filters,
                    category: isSelected ? undefined : cat.slug,
                  })
                }
                className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-trust text-white shadow-xs'
                    : 'border border-border/80 bg-surface text-ink-soft hover:bg-canvas-alt hover:text-ink'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile Filter Toggle Button */}
      <div className="mt-4 flex items-center justify-between lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="gap-2 text-xs"
        >
          <SlidersHorizontal className="size-3.5 text-trust" />
          {mobileFilterOpen ? 'Hide Filters' : 'Faceted Filters'}
          {activeFilterCount > 0 && (
            <Badge variant="trust" className="text-[10px] px-1.5 py-0">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {(activeFilterCount > 0 || q) && (
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="gap-1 text-xs text-ink-soft">
            <RotateCcw className="size-3" />
            Clear All
          </Button>
        )}
      </div>

      {/* Collapsible Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-4 shadow-sm lg:hidden animate-fade-down">
          <SearchFilterSidebar
            categories={categories}
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            activeCount={activeFilterCount}
          />
        </div>
      )}

      {/* Two-Column Search Layout (Sidebar + Results) */}
      <div className="mt-8 flex items-start gap-8">
        {/* Desktop Faceted Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 rounded-2xl border border-border bg-surface p-5 shadow-sm sticky top-24">
          <SearchFilterSidebar
            categories={categories}
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            activeCount={activeFilterCount}
          />
        </aside>

        {/* Main Results Column */}
        <main className="flex-1 min-w-0">
          {/* Active Filter Badges Bar */}
          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-ink-faint">Active Filters:</span>

              {filters.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-trust-soft px-2.5 py-1 text-xs font-medium text-trust">
                  Category: {categories.find((c) => c.slug === filters.category)?.name || filters.category}
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, category: undefined })}
                    className="ml-1 cursor-pointer hover:text-ink"
                    aria-label="Remove category filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {filters.mode && (
                <span className="inline-flex items-center gap-1 rounded-full bg-hope-soft px-2.5 py-1 text-xs font-medium text-hope-deep">
                  Mode: {filters.mode}
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, mode: undefined })}
                    className="ml-1 cursor-pointer hover:text-ink"
                    aria-label="Remove mode filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-faith-soft px-2.5 py-1 text-xs font-medium text-faith-deep">
                  Price: ₹{filters.minPrice ?? 0} – ₹{filters.maxPrice ?? '∞'}
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, minPrice: undefined, maxPrice: undefined })}
                    className="ml-1 cursor-pointer hover:text-ink"
                    aria-label="Remove price filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-ink-faint hover:text-ink underline ml-1 cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}

          {/* Results Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <TabsList className="bg-canvas-alt/80">
                <TabsTrigger value="listings" className="text-xs sm:text-sm">
                  Listings {listings ? `(${listings.meta.total ?? listings.data.length})` : ''}
                </TabsTrigger>
                <TabsTrigger value="needs" className="text-xs sm:text-sm">
                  Community Needs {needs ? `(${needs.meta.total ?? needs.data.length})` : ''}
                </TabsTrigger>
              </TabsList>

              <span className="hidden sm:block text-xs text-ink-faint">
                {activeTab === 'listings'
                  ? `${listings?.data?.length ?? 0} items displayed`
                  : `${needs?.data?.length ?? 0} requests displayed`}
              </span>
            </div>

            {/* Listings Tab */}
            <TabsContent value="listings" className="mt-6">
              {listingsLoading ? (
                <CardGridSkeleton count={4} />
              ) : !listings || listings.data.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="No listings matched your criteria"
                  description={
                    q || activeFilterCount > 0
                      ? `We couldn't find any listings matching your search or filters. Try adjusting your query.`
                      : 'Type what you are looking for above or browse categories.'
                  }
                  action={
                    activeFilterCount > 0 || q ? (
                      <Button variant="outline" size="sm" onClick={handleClearAll}>
                        Clear All Filters & Search
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {listings.data.map((l) => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Needs Tab */}
            <TabsContent value="needs" className="mt-6">
              {needsLoading ? (
                <CardGridSkeleton count={4} />
              ) : !needs || needs.data.length === 0 ? (
                <EmptyState
                  icon={PackageSearch}
                  title="No community needs found"
                  description={
                    q || activeFilterCount > 0
                      ? `No open needs matched your current search or category filter.`
                      : 'Start typing to find what community members are requesting.'
                  }
                  action={
                    activeFilterCount > 0 || q ? (
                      <Button variant="outline" size="sm" onClick={handleClearAll}>
                        Clear All Filters & Search
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {needs.data.map((n) => (
                    <NeedCard key={n.id} need={n} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <CardGridSkeleton count={6} />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
