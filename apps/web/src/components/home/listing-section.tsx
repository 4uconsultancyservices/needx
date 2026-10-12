'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useListingSearch } from '@/hooks/use-listings';
import { ListingCard } from '@/components/listings/listing-card';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { PackageSearch } from 'lucide-react';

export function ListingSection({ title, subtitle, href }: { title: string; subtitle?: string; href: string }) {
  const { data, isLoading } = useListingSearch({ sort: 'newest', limit: 4 });

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
        </div>
        <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-trust hover:text-trust-deep hover:underline transition-colors">
          View all <ArrowRight className="size-3.5" />
        </Link>
      </div>
      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={PackageSearch} title="No listings yet" description="Be the first provider to list something in your city." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.data.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
}
