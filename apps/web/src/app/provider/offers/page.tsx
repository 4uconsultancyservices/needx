'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useMyOffers } from '@/hooks/use-offers';
import { OfferCard } from '@/components/offers/offer-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { Pagination } from '@/components/shared/pagination';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'SENT', label: 'Sent' },
  { value: 'COUNTERED', label: 'Countered' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Declined' },
];

export default function ProviderOffersPage() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyOffers({ page, status: status === 'all' ? undefined : status });

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
        <EmptyState icon={Send} title="No offers sent yet" description="Browse matching requests and send your first offer." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.data.map((offer) => (
              <OfferCard key={offer.id} offer={offer} perspective="provider" />
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
