'use client';

import { Tent } from 'lucide-react';
import { useMyOrders } from '@/hooks/use-orders';
import { OrderCard } from '@/components/orders/order-card';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';

export default function MyRentalsPage() {
  const { data, isLoading } = useMyOrders({ page: 1 });
  const rentals = data?.data.filter((o) => o.type === 'RENT') ?? [];

  return (
    <div>
      <p className="mb-5 text-sm text-ink-soft">Rental orders, pickup to return.</p>
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : rentals.length === 0 ? (
        <EmptyState icon={Tent} title="No rentals yet" description="Rental orders will show up here once you rent something." />
      ) : (
        <div className="space-y-3">
          {rentals.map((order) => (
            <OrderCard key={order.id} order={order} basePath="/dashboard/orders" />
          ))}
        </div>
      )}
    </div>
  );
}
