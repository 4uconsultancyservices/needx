'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminOrders } from '@/hooks/use-admin';
import { AdminResourceTable } from '@/components/admin/admin-resource-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/shared/pagination';
import { formatDate, formatPrice, ORDER_STATUS_LABELS } from '@/lib/utils';
import type { Order } from '@needx/types';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { data, isLoading } = useAdminOrders({
    page,
    limit: 20,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Deals & Escrow Orders
            </h1>
            <Badge variant="trust" className="text-xs">Escrow Secured</Badge>
          </div>
          <p className="mt-1 text-xs text-ink-soft sm:text-sm">
            Platform transaction settlement, escrow fund holding, and 10% fee ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 font-mono-num text-xs">
            {data?.meta.total ?? 0} Settled Orders
          </Badge>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-border/80 bg-surface p-1 shadow-xs">
        {[
          { id: 'ALL', label: 'All Orders' },
          { id: 'PAID', label: 'Escrow Paid' },
          { id: 'ACTIVE', label: 'In Progress' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'CANCELLED', label: 'Cancelled / Refunded' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === tab.id
                ? 'bg-trust text-white shadow-xs'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CRM Orders Table */}
      <AdminResourceTable<Order>
        items={data?.data}
        isLoading={isLoading}
        getRowKey={(o) => o.id}
        emptyMessage="No orders found matching status criteria"
        columns={[
          {
            header: 'Deal Reference',
            render: (o) => (
              <div>
                <span className="font-mono text-xs font-bold text-ink">
                  #{o.id.slice(-8).toUpperCase()}
                </span>
                <span className="block text-[11px] text-ink-faint uppercase font-semibold">
                  {o.type}
                </span>
              </div>
            ),
          },
          {
            header: 'Deal Status',
            render: (o) => (
              <Badge
                variant={
                  o.status === 'COMPLETED'
                    ? 'faith'
                    : o.status === 'CANCELLED'
                    ? 'danger'
                    : o.status === 'ACTIVE'
                    ? 'hope'
                    : 'trust'
                }
                className="text-[10px]"
              >
                {ORDER_STATUS_LABELS[o.status] ?? o.status}
              </Badge>
            ),
          },
          {
            header: 'Gross Amount',
            render: (o) => (
              <span className="font-mono-num text-sm font-bold text-ink">
                {formatPrice(o.amount, o.currency)}
              </span>
            ),
          },
          {
            header: 'Platform Fee (10%)',
            render: (o) => (
              <span className="font-mono-num text-xs font-semibold text-faith">
                {formatPrice(Math.round(o.amount * 0.1), o.currency)}
              </span>
            ),
          },
          {
            header: 'Parties',
            render: (o) => (
              <div className="text-xs text-ink-soft">
                <span className="block">Buyer: <code className="font-mono text-ink text-[11px]">{o.buyerId.slice(-6)}</code></span>
                <span className="block">Provider: <code className="font-mono text-ink text-[11px]">{o.providerId.slice(-6)}</code></span>
              </div>
            ),
          },
          {
            header: 'Created',
            render: (o) => (
              <span className="font-mono text-xs text-ink-faint">
                {formatDate(o.createdAt)}
              </span>
            ),
          },
          {
            header: 'Actions',
            render: (o) => (
              <Button size="sm" variant="outline" asChild className="h-8 text-xs px-2.5">
                <Link href={`/dashboard/orders/${o.id}`}>
                  Inspect Order
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
