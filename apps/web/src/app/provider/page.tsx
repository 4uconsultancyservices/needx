'use client';

import Link from 'next/link';
import { ArrowRight, Inbox, ShoppingBag, Star, Store } from 'lucide-react';
import { isUserProvider, useCurrentUser } from '@/hooks/use-auth';
import { useMyListings } from '@/hooks/use-listings';
import { useMyOffers } from '@/hooks/use-offers';
import { useMyProviderOrders } from '@/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';

export default function ProviderOverviewPage() {
  const { data: user } = useCurrentUser();
  const isProvider = isUserProvider(user);
  const { data: listings } = useMyListings({ page: 1, status: 'ACTIVE' });
  const { data: offers } = useMyOffers({ page: 1 });
  const { data: orders } = useMyProviderOrders({ page: 1 });

  if (user && !isProvider) {
    return (
      <EmptyState
        icon={Store}
        title="You're not a provider yet"
        description="Turn on provider mode from Settings to start listing products or services."
        action={
          <Button variant="default" asChild>
            <Link href="/dashboard/settings">Become a provider</Link>
          </Button>
        }
      />
    );
  }

  const pendingOffers = offers?.data.filter((o) => ['SENT', 'VIEWED', 'COUNTERED'].includes(o.status)).length ?? 0;
  const openOrders = orders?.data.filter((o) => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status)).length ?? 0;

  return (
    <div className="space-y-8">
      <p className="text-sm text-ink-soft">{user?.provider?.businessName || user?.name}&apos;s provider dashboard</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card-surface p-4">
          <Store className="size-5 text-trust" />
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{listings?.meta.total ?? 0}</p>
          <p className="text-xs text-ink-faint">Active listings</p>
        </div>
        <div className="card-surface p-4">
          <Inbox className="size-5 text-hope" />
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{pendingOffers}</p>
          <p className="text-xs text-ink-faint">Pending offers</p>
        </div>
        <div className="card-surface p-4">
          <ShoppingBag className="size-5 text-faith" />
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{openOrders}</p>
          <p className="text-xs text-ink-faint">Open orders</p>
        </div>
        <div className="card-surface p-4">
          <Star className="size-5 text-amber-500 fill-amber-500/20" />
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{user?.trust.ratingAverage.toFixed(1) ?? '—'}</p>
          <p className="text-xs text-ink-faint">Your rating</p>
        </div>
      </div>

      <Link href="/provider/requests" className="card-surface flex items-center justify-between p-5 hover:shadow-card-hover">
        <div>
          <p className="font-medium text-ink">See needs matching your listings</p>
          <p className="text-sm text-ink-soft">NEEDX ranks open needs by how well they fit what you offer.</p>
        </div>
        <ArrowRight className="size-5 text-ink-faint" />
      </Link>
    </div>
  );
}
