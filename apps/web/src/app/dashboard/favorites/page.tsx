'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/use-misc';
import { useListing } from '@/hooks/use-listings';
import { ListingCard } from '@/components/listings/listing-card';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';

function FavoriteListing({ targetId }: { targetId: string }) {
  const { data: listing } = useListing(targetId);
  if (!listing) return null;
  return <ListingCard listing={listing} />;
}

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useFavorites('LISTING');

  if (isLoading) return <CardGridSkeleton count={4} />;
  if (!favorites || favorites.length === 0) {
    return <EmptyState icon={Heart} title="No favorites yet" description="Tap the heart on any listing to save it here." />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {favorites.map((f) => (
        <FavoriteListing key={f.id} targetId={f.targetId} />
      ))}
    </div>
  );
}
