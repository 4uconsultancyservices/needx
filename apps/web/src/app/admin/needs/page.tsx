'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles, MapPin } from 'lucide-react';
import { useAdminNeeds } from '@/hooks/use-admin';
import { AdminResourceTable } from '@/components/admin/admin-resource-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/shared/pagination';
import { formatDate } from '@/lib/utils';
import type { Need } from '@needx/types';

export default function AdminNeedsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminNeeds({ page, limit: 20 });

  return (
    <div className="space-y-6">
      {/* CRM Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Needs Demand Pipeline
            </h1>
            <Badge variant="hope" className="text-xs">Demand Stream</Badge>
          </div>
          <p className="mt-1 text-xs text-ink-soft sm:text-sm">
            Live community requests, algorithmic match statuses, and seeker-provider fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 font-mono-num text-xs">
            {data?.meta.total ?? 0} Total Requests
          </Badge>
          <Button variant="hope" size="sm" asChild className="text-xs">
            <Link href="/needs/new" target="_blank">
              Post Test Need <ExternalLink className="size-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* CRM Table */}
      <AdminResourceTable<Need>
        items={data?.data}
        isLoading={isLoading}
        getRowKey={(n) => n.id}
        emptyMessage="No community needs recorded yet"
        columns={[
          {
            header: 'Need Demand',
            render: (n) => (
              <div>
                <Link
                  href={`/needs/${n.id}`}
                  className="font-semibold text-ink hover:text-trust hover:underline block"
                >
                  {n.title}
                </Link>
                <span className="font-mono text-[11px] text-ink-faint">
                  #{n.id.slice(-6).toUpperCase()}
                </span>
              </div>
            ),
          },
          {
            header: 'Status',
            render: (n) => (
              <Badge
                variant={
                  ['ACTIVE', 'MATCHING'].includes(n.status)
                    ? 'hope'
                    : n.status === 'FULFILLED'
                    ? 'faith'
                    : 'default'
                }
                className="text-[10px]"
              >
                {n.status}
              </Badge>
            ),
          },
          {
            header: 'Location Hub',
            render: (n) => (
              <span className="flex items-center gap-1 text-xs text-ink-soft">
                <MapPin className="size-3 text-ink-faint shrink-0" />
                {n.location.city ?? '—'}
              </span>
            ),
          },
          {
            header: 'Algorithmic Matches',
            render: (n) => (
              <div className="flex items-center gap-1.5 font-mono-num text-xs font-semibold text-ink">
                <Sparkles className="size-3 text-trust" />
                <span>{n.matchCount ?? 0} providers</span>
              </div>
            ),
          },
          {
            header: 'Budget Scope',
            render: (n) => (
              <span className="font-mono-num text-xs text-ink">
                {n.budget?.max ? `Up to ₹${n.budget.max.toLocaleString('en-IN')}` : 'Flexible'}
              </span>
            ),
          },
          {
            header: 'Posted',
            render: (n) => (
              <span className="font-mono text-xs text-ink-faint">
                {formatDate(n.createdAt)}
              </span>
            ),
          },
          {
            header: 'Actions',
            render: (n) => (
              <Button size="sm" variant="outline" asChild className="h-8 text-xs px-2.5">
                <Link href={`/needs/${n.id}`}>
                  View Need
                </Link>
              </Button>
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
