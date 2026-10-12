'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useMyProviderOrders } from '@/hooks/use-orders';
import { OrderCard } from '@/components/orders/order-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { Pagination } from '@/components/shared/pagination';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'PAID', label: 'To confirm' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function ProviderOrdersPage() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyProviderOrders({ page, status: status === 'all' ? undefined : status });

  return (
    <div>
      <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1); }} className="mb-5">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders yet" description="Orders appear here once one of your offers is accepted." />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((order) => (
              <OrderCard key={order.id} order={order} basePath="/provider/orders" />
            ))}
          </div>
          <div className="mt-5">
            <Pagination page={page} hasMore={data.meta.hasMore} onPageChange={setPage} total={data.meta.total} limit={data.meta.limit} />
          </div>
        </>
      )}
    </div>
  );
}
