'use client';

import { use } from 'react';
import { useCategory } from '@/hooks/use-categories';
import { useListingSearch } from '@/hooks/use-listings';
import { ListingCard } from '@/components/listings/listing-card';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: category, isLoading: categoryLoading } = useCategory(slug);
  const { data: listings, isLoading: listingsLoading } = useListingSearch({ categoryId: category?.id, limit: 24 });

  if (categoryLoading) return <div className="mx-auto max-w-7xl px-4 py-14"><CardGridSkeleton count={6} /></div>;
  if (!category) return <EmptyState title="Category not found" className="mx-auto mt-14 max-w-lg" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{category.name}</h1>
          {category.description && <p className="mt-1 text-sm text-ink-soft">{category.description}</p>}
        </div>
        <Button variant="hope" asChild>
          <Link href={`/needs/new?text=${encodeURIComponent(`I need something in ${category.name}`)}`}>
            Post a need in this category <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        {listingsLoading ? (
          <CardGridSkeleton count={9} />
        ) : !listings || listings.data.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No listings in this category yet" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.data.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
