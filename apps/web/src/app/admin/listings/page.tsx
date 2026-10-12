'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ExternalLink, Package } from 'lucide-react';
import { useAdminArchiveListing, useAdminListings } from '@/hooks/use-admin';
import { AdminResourceTable } from '@/components/admin/admin-resource-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/shared/pagination';
import { formatDate, formatPrice, TRANSACTION_MODE_LABELS } from '@/lib/utils';
import type { Listing } from '@needx/types';

export default function AdminListingsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminListings({ page, limit: 20 });
  const archive = useAdminArchiveListing();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Provider Inventory Catalog
            </h1>
            <Badge variant="trust" className="text-xs">Supply Registry</Badge>
          </div>
          <p className="mt-1 text-xs text-ink-soft sm:text-sm">
            Active items, rental units, and service offerings listed across all verified providers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 font-mono-num text-xs">
            {data?.meta.total ?? 0} Listed Items
          </Badge>
        </div>
      </div>

      {/* CRM Inventory Table */}
      <AdminResourceTable<Listing>
        items={data?.data}
        isLoading={isLoading}
        getRowKey={(l) => l.id}
        emptyMessage="No provider listings recorded yet"
        columns={[
          {
            header: 'Item / Service',
            render: (l) => (
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg overflow-hidden bg-canvas-alt shrink-0 flex items-center justify-center border border-border">
                  {l.images[0] ? (
                    <img src={l.images[0]} alt={l.title} className="size-full object-cover" />
                  ) : (
                    <Package className="size-5 text-ink-faint" />
                  )}
                </div>
                <div>
                  <Link
                    href={`/listings/${l.id}`}
                    className="font-semibold text-ink hover:text-trust hover:underline block line-clamp-1"
                  >
                    {l.title}
                  </Link>
                  <span className="font-mono text-[11px] text-ink-faint">
                    #{l.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            ),
          },
          {
            header: 'Status',
            render: (l) => (
              <Badge
                variant={
                  l.status === 'ACTIVE'
                    ? 'faith'
                    : l.status === 'ARCHIVED'
                    ? 'danger'
                    : 'default'
                }
                className="text-[10px]"
              >
                {l.status}
              </Badge>
            ),
          },
          {
            header: 'Price Rate',
            render: (l) => (
              <span className="font-mono-num text-xs font-bold text-ink">
                {formatPrice(l.price.amount, l.price.currency)}
                {l.price.unit && <span className="text-ink-faint font-normal"> /{l.price.unit.toLowerCase()}</span>}
              </span>
            ),
          },
          {
            header: 'Modes',
            render: (l) => (
              <div className="flex flex-wrap gap-1">
                {l.modes.map((m) => (
                  <Badge key={m} variant="trust" className="text-[10px] px-1.5 py-0">
                    {TRANSACTION_MODE_LABELS[m] ?? m}
                  </Badge>
                ))}
              </div>
            ),
          },
          {
            header: 'Listed Date',
            render: (l) => (
              <span className="font-mono text-xs text-ink-faint">
                {formatDate(l.createdAt)}
              </span>
            ),
          },
          {
            header: 'Actions',
            render: (l) => (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" asChild className="h-8 text-xs px-2.5">
                  <Link href={`/listings/${l.id}`} target="_blank">
                    View <ExternalLink className="size-3" />
                  </Link>
                </Button>
                {l.status !== 'ARCHIVED' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await archive.mutateAsync(l.id);
                      toast('Listing archived');
                    }}
                    className="h-8 text-xs text-danger hover:bg-danger-soft px-2.5"
                  >
                    Archive
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      {data && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-ink-faint">
            Page {page} of {Math.ceil((data.meta.total ?? 1) / 20)}
          </p>
          <Pagination
            page={page}
            hasMore={(data.meta.total ?? 0) > page * 20}
            onPageChange={setPage}
            total={data.meta.total}
            limit={20}
          />
        </div>
      )}
    </div>
  );
}
