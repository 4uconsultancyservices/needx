'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { usePublicProviders } from '@/hooks/use-users';
import { useCategories } from '@/hooks/use-categories';
import { useDebounce } from '@/hooks/use-debounce';
import { ProviderCard } from '@/components/providers/provider-card';
import { ProviderCardSkeleton } from '@/components/shared/loading-skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const POPULAR_CITIES = ['All Cities', 'Bengaluru', 'Delhi NCR', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai'];

export default function ProvidersDirectoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All Cities');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<'rating' | 'newest' | 'transactions'>('rating');

  const debouncedSearch = useDebounce(search);
  const { data: categoriesData } = useCategories();

  const { data: providersData, isLoading } = usePublicProviders({
    page,
    limit: 12,
    q: debouncedSearch || undefined,
    city: city === 'All Cities' ? undefined : city,
    category: selectedCategory === 'ALL' ? undefined : selectedCategory,
    minRating: minRating > 0 ? minRating : undefined,
    verifiedOnly: verifiedOnly || undefined,
    sort,
  });

  const providers = providersData?.data ?? [];
  const total = providersData?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 12));

  const handleReset = () => {
    setSearch('');
    setCity('All Cities');
    setSelectedCategory('ALL');
    setMinRating(0);
    setVerifiedOnly(false);
    setSort('rating');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search) ||
    city !== 'All Cities' ||
    selectedCategory !== 'ALL' ||
    minRating > 0 ||
    verifiedOnly ||
    sort !== 'rating';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-up">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-trust/20 bg-gradient-to-br from-trust-deep via-[#112d52] to-[#0d3b4c] px-6 py-12 text-white shadow-lg sm:px-12 sm:py-16">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="hope" className="mb-3 text-xs tracking-wider uppercase">
            <Sparkles className="size-3 mr-1" />
            Verified Marketplace Professionals
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Find Local Providers & Specialists
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed">
            Connect with verified equipment owners, certified freelancers, and trusted community providers
            ready to fulfill your needs.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild variant="default" className="bg-hope text-white hover:bg-hope-deep font-semibold shadow-sm">
              <Link href="/needs/new">
                Post What You Need
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Link href="/provider/upgrade">Join as Provider</Link>
            </Button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-hope/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/3 size-72 rounded-full bg-trust/30 blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
              <Input
                placeholder="Search by provider name, skills, equipment, or business..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-11 pl-10 text-sm rounded-xl"
              />
            </div>

            {/* City Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCity(c);
                    setPage(1);
                  }}
                  className={`cursor-pointer whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    city === c
                      ? 'bg-trust text-white shadow-xs'
                      : 'border border-border/80 bg-canvas text-ink-soft hover:bg-canvas-alt hover:text-ink'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Dropdown */}
              <select
                aria-label="Filter by Service Category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-lg border border-border bg-canvas px-3 text-xs text-ink focus:border-hope focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categoriesData?.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Minimum Rating */}
              <select
                aria-label="Filter by Minimum Rating"
                value={minRating}
                onChange={(e) => {
                  setMinRating(Number(e.target.value));
                  setPage(1);
                }}
                className="h-9 rounded-lg border border-border bg-canvas px-3 text-xs text-ink focus:border-hope focus:outline-none"
              >
                <option value="0">Any Rating</option>
                <option value="4">★ 4.0 & above</option>
                <option value="4.5">★ 4.5 & above</option>
                <option value="4.8">★ 4.8 & above</option>
              </select>

              {/* Verified Only Toggle */}
              <button
                type="button"
                onClick={() => {
                  setVerifiedOnly(!verifiedOnly);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 h-9 rounded-lg px-3 transition-colors cursor-pointer border ${
                  verifiedOnly
                    ? 'border-trust/40 bg-trust-soft text-trust font-semibold'
                    : 'border-border bg-canvas text-ink-soft hover:bg-canvas-alt'
                }`}
              >
                <ShieldCheck className="size-3.5" />
                Verified Only
              </button>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 gap-1 text-xs text-ink-soft">
                  <X className="size-3.5" />
                  Reset Filters
                </Button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-ink-faint font-medium">Sort:</span>
              <select
                aria-label="Sort providers"
                value={sort}
                onChange={(e) => setSort(e.target.value as 'rating' | 'newest' | 'transactions')}
                className="h-9 rounded-lg border border-border bg-canvas px-3 text-xs text-ink focus:border-hope focus:outline-none"
              >
                <option value="rating">Highest Rated</option>
                <option value="transactions">Most Completed</option>
                <option value="newest">Recently Joined</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Results */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-ink-soft">
            Showing <strong className="text-ink">{providers.length}</strong> of{' '}
            <strong className="text-ink">{total}</strong> verified providers
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No providers found"
            description="No providers matched your current search and filter combination."
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              page={page}
              hasMore={page < totalPages}
              onPageChange={setPage}
              total={total}
              limit={12}
            />
          </div>
        )}
      </div>

      {/* Provider Recruitment Callout */}
      <div className="mt-16 rounded-3xl border border-hope/20 bg-gradient-to-r from-hope-soft/60 via-canvas to-trust-soft/40 p-8 sm:p-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="max-w-xl">
          <Badge variant="faith" className="mb-2">
            Grow Your Business
          </Badge>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
            Are you a service specialist or equipment owner?
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-ink-soft">
            Join thousands of professionals earning on NEEDX. Discover local needs in your city, submit
            custom quotes, and build trusted client relationships with 100% escrow protection.
          </p>
        </div>
        <Button asChild size="lg" className="bg-trust text-white hover:bg-trust-deep font-semibold shadow-sm shrink-0">
          <Link href="/provider/upgrade">
            Register as Provider
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
