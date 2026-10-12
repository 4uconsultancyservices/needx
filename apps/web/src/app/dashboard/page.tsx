'use client';

import Link from 'next/link';
import { ArrowRight, Package, ShoppingBag, Star } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-auth';
import { useMyNeeds } from '@/hooks/use-needs';
import { useMyOrders } from '@/hooks/use-orders';
import { NeedCard } from '@/components/needs/need-card';
import { EmptyState } from '@/components/shared/empty-state';
import { DashboardSkeleton } from '@/components/shared/loading-skeletons';
import { Button } from '@/components/ui/button';

export default function DashboardOverviewPage() {
  const { data: user } = useCurrentUser();
  const { data: needs, isLoading: needsLoading } = useMyNeeds({ page: 1 });
  const { data: orders } = useMyOrders({ page: 1 });

  const activeNeeds = needs?.data.filter((n) => ['ACTIVE', 'MATCHING'].includes(n.status)).length ?? 0;
  const openOrders = orders?.data.filter((o) => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status)).length ?? 0;

  return (
    <div className="space-y-8">
      <p className="text-sm text-ink-soft">Welcome back, {user?.name.split(' ')[0]}.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card-surface p-4">
          <Package className="size-5 text-hope" />
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{activeNeeds}</p>
          <p className="text-xs text-ink-faint">Active needs</p>
        </div>
        <div className="card-surface p-4">
          <ShoppingBag className="size-5 text-trust" />
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{openOrders}</p>
          <p className="text-xs text-ink-faint">Open orders</p>
        </div>
        <div className="card-surface p-4">
          <Star className="size-5 text-amber-500 fill-amber-500/20" />
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{user?.trust.ratingAverage.toFixed(1) ?? '—'}</p>
          <p className="text-xs text-ink-faint">Your rating</p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recent needs</h2>
          <Link href="/dashboard/needs" className="flex items-center gap-1 text-sm font-medium text-trust hover:underline">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {needsLoading ? (
          <DashboardSkeleton />
        ) : !needs || needs.data.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No active needs yet"
            description="Tell us what you're looking for and we'll help you find someone who can provide it."
            action={
              <Button variant="hope" asChild>
                <Link href="/needs/new">Post a need</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {needs.data.slice(0, 4).map((need) => (
              <NeedCard key={need.id} need={need} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
