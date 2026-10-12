'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';
import { useMyNeeds } from '@/hooks/use-needs';
import { NeedCard } from '@/components/needs/need-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { Pagination } from '@/components/shared/pagination';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'MATCHING', label: 'Matching' },
  { value: 'FULFILLED', label: 'Fulfilled' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function MyNeedsPage() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyNeeds({ page, status: status === 'all' ? undefined : status });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button variant="hope" size="sm" asChild>
          <Link href="/needs/new">
            <Plus /> New need
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={Package} title="No needs here yet" description="Post a need and NEEDX will start finding matches immediately." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.data.map((need) => (
              <NeedCard key={need.id} need={need} />
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
