'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Store } from 'lucide-react';
import { useMyListings, useSetListingStatus } from '@/hooks/use-listings';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { ListingCard } from '@/components/listings/listing-card';
import { Badge } from '@/components/ui/badge';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export default function ProviderListingsPage() {
  const [status, setStatus] = useState('all');
  const { data, isLoading } = useMyListings({ page: 1, status: status === 'all' ? undefined : status });
  const setListingStatus = useSetListingStatus();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button variant="default" size="sm" asChild>
          <Link href="/provider/listings/new">
            <Plus /> New listing
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState icon={Store} title="No listings yet" description="Create your first listing to start receiving matches." action={<Button variant="default" asChild><Link href="/provider/listings/new">Create a listing</Link></Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.data.map((listing) => (
            <div key={listing.id} className="space-y-2">
              <ListingCard listing={listing} />
              <div className="flex items-center justify-between px-1">
                <Badge variant={listing.status === 'ACTIVE' ? 'faith' : 'default'}>{listing.status}</Badge>
                <div className="flex gap-1.5">
                  {listing.status !== 'ACTIVE' && (
                    <Button size="sm" variant="outline" onClick={() => setListingStatus.mutate({ id: listing.id, action: 'activate' })}>
                      Activate
                    </Button>
                  )}
                  {listing.status === 'ACTIVE' && (
                    <Button size="sm" variant="outline" onClick={() => setListingStatus.mutate({ id: listing.id, action: 'pause' })}>
                      Pause
                    </Button>
                  )}
                  {listing.status !== 'ARCHIVED' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setListingStatus.mutate({ id: listing.id, action: 'archive' });
                        toast('Listing archived');
                      }}
                    >
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
