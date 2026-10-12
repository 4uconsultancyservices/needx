'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowRight, Store, Sparkles } from 'lucide-react';
import { useCurrentUser, isUserProvider } from '@/hooks/use-auth';
import { useMyListings } from '@/hooks/use-listings';
import { ListingCard } from '@/components/listings/listing-card';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { Button } from '@/components/ui/button';

export default function MyListingsPreviewPage() {
  const { data: user } = useCurrentUser();
  const isProvider = isUserProvider(user);
  const { data, isLoading } = useMyListings({ page: 1 });

  if (!isProvider) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center shadow-card">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-hope-soft text-hope border border-hope/20">
          <Store className="size-7" />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold text-ink">Provider Account Required</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          You are currently in Seeker mode. To create and manage listings, you need to activate your provider profile.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="hope" asChild className="font-semibold shadow-sm">
            <Link href="/dashboard/settings">
              <Sparkles className="size-4" /> Become a Provider
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to Overview</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-ink-soft">Manage your listings from the provider dashboard.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/provider/listings">
            Go to provider dashboard <ArrowRight />
          </Link>
        </Button>
      </div>
      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="You have no listings yet"
          description="List a product or service to start receiving matches from people who need it."
          action={
            <Button variant="default" asChild>
              <Link href="/provider/listings/new">Create a listing</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.data.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
