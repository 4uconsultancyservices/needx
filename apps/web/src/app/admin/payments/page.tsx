'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Coins,
  CreditCard,
  Download,
  Filter,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { useAdminLedgerEntries, useAdminLedgerSummary } from '@/hooks/use-admin';
import { useDebounce } from '@/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/shared/pagination';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate, formatPrice } from '@/lib/utils';
import type { LedgerEntryType } from '@needx/types';

const LEDGER_TYPE_CONFIG: Record<
  LedgerEntryType,
  { label: string; variant: 'hope' | 'trust' | 'faith' | 'accent' | 'danger' | 'default'; isCredit: boolean }
> = {
  CUSTOMER_PAYMENT: { label: 'Customer Payment', variant: 'trust', isCredit: true },
  PLATFORM_FEE: { label: 'Platform Fee (10%)', variant: 'hope', isCredit: true },
  PROVIDER_PAYABLE: { label: 'Provider Payable', variant: 'faith', isCredit: false },
  DEPOSIT: { label: 'Deposit Held', variant: 'accent', isCredit: true },
  DEPOSIT_RELEASE: { label: 'Deposit Released', variant: 'faith', isCredit: false },
  REFUND: { label: 'Customer Refund', variant: 'danger', isCredit: false },
  PENALTY: { label: 'Dispute Penalty', variant: 'danger', isCredit: false },
  ADJUSTMENT: { label: 'Balance Adjustment', variant: 'default', isCredit: true },
  PAYOUT: { label: 'Provider Payout', variant: 'default', isCredit: false },
};

const FILTER_TYPES: Array<{ value: LedgerEntryType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Transactions' },
  { value: 'PLATFORM_FEE', label: 'Platform Fees' },
  { value: 'CUSTOMER_PAYMENT', label: 'Payments' },
  { value: 'PROVIDER_PAYABLE', label: 'Provider Payables' },
  { value: 'DEPOSIT', label: 'Escrow Deposits' },
  { value: 'DEPOSIT_RELEASE', label: 'Deposit Releases' },
  { value: 'REFUND', label: 'Refunds' },
  { value: 'PAYOUT', label: 'Payouts' },
];

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<LedgerEntryType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const debouncedSearch = useDebounce(search);

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useAdminLedgerSummary();
  const {
    data: entriesData,
    isLoading: entriesLoading,
    refetch: refetchEntries,
  } = useAdminLedgerEntries({
    page,
    limit: 20,
    type: selectedType === 'ALL' ? undefined : selectedType,
    search: debouncedSearch || undefined,
    orderId: orderFilter.trim() || undefined,
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchEntries();
  };

  const handleResetFilters = () => {
    setSelectedType('ALL');
    setSearch('');
    setOrderFilter('');
    setPage(1);
  };

  const entries = entriesData?.data ?? [];
  const total = entriesData?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Treasury & Financial Ledger
            </h1>
            <Badge variant="trust" className="text-xs">
              Double-Entry Core
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Audit immutable platform transactions, escrow liabilities, provider disbursements, and fee realization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 text-xs">
            <RefreshCw className="size-3.5" />
            Sync Ledger
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Net Platform Realized Fees */}
        <div className="rounded-2xl border border-hope/20 bg-gradient-to-br from-hope/5 via-surface to-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-hope-deep">Platform Revenue</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-hope-soft text-hope-deep">
              <Coins className="size-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono-num text-2xl font-bold text-ink">
              {summaryLoading ? '...' : formatPrice(summary?.platformRevenue ?? 0)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
            <TrendingUp className="size-3.5 text-hope" />
            <span>10% take-rate on completed orders</span>
          </div>
        </div>

        {/* Gross Volume */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Gross Processed (GMV)</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-trust-soft text-trust">
              <CreditCard className="size-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono-num text-2xl font-bold text-ink">
              {summaryLoading ? '...' : formatPrice(summary?.grossVolume ?? 0)}
            </span>
          </div>
          <div className="mt-2 text-xs text-ink-faint">
            Across {summaryLoading ? '...' : (summary?.totalEntries ?? 0)} total ledger postings
          </div>
        </div>

        {/* Provider Payables */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Provider Payables</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-faith-soft text-faith-deep">
              <Wallet className="size-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono-num text-2xl font-bold text-ink">
              {summaryLoading ? '...' : formatPrice(summary?.providerPayables ?? 0)}
            </span>
          </div>
          <div className="mt-2 text-xs text-ink-faint">
            Payouts processed: {summaryLoading ? '...' : formatPrice(summary?.payoutsTotal ?? 0)}
          </div>
        </div>

        {/* Escrow Deposits */}
        <div className="rounded-2xl border border-accent/30 bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-deep">Escrow Deposits Held</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
              <Lock className="size-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono-num text-2xl font-bold text-ink">
              {summaryLoading ? '...' : formatPrice(summary?.depositsHeld ?? 0)}
            </span>
          </div>
          <div className="mt-2 text-xs text-ink-faint">Refund liability reserve for rentals</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
              <Input
                placeholder="Search descriptions, notes..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-10 pl-9 text-xs"
              />
            </div>

            <div className="relative min-w-[160px] flex-1 sm:max-w-[200px]">
              <Input
                placeholder="Filter by Order ID..."
                value={orderFilter}
                onChange={(e) => {
                  setOrderFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 font-mono text-xs"
              />
            </div>

            {(selectedType !== 'ALL' || search || orderFilter) && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-10 gap-1.5 text-xs text-ink-soft">
                <X className="size-3.5" />
                Reset
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs sm:pb-0">
            {FILTER_TYPES.map((type) => {
              const isActive = selectedType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setSelectedType(type.value);
                    setPage(1);
                  }}
                  className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
                    isActive
                      ? 'bg-trust text-white shadow-xs'
                      : 'border border-border/80 bg-canvas text-ink-soft hover:bg-canvas-alt hover:text-ink'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">Ledger Postings</h2>
            <p className="text-xs text-ink-faint">
              Showing {entries.length} of {total} verified double-entry logs
            </p>
          </div>
        </div>

        {entriesLoading ? (
          <div className="p-12 text-center text-sm text-ink-soft">
            <RefreshCw className="mx-auto size-6 animate-spin text-hope mb-2" />
            Loading financial records...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={Banknote}
              title="No ledger entries found"
              description="No financial transactions match your current query or filter criteria."
              action={
                selectedType !== 'ALL' || search || orderFilter ? (
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Clear Filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-canvas/60 text-ink-faint font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Posting Date</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Entity / Reference</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {entries.map((entry) => {
                  const typeMeta = LEDGER_TYPE_CONFIG[entry.type] ?? {
                    label: entry.type,
                    variant: 'default' as const,
                    isCredit: entry.amount >= 0,
                  };
                  const isPositive = entry.amount >= 0;

                  return (
                    <tr key={entry.id} className="hover:bg-canvas/40 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-ink-soft">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant={typeMeta.variant} className="text-[11px] font-medium">
                          {typeMeta.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 max-w-sm">
                        <div className="font-medium text-ink">{entry.description}</div>
                        <div className="text-[11px] font-mono text-ink-faint">ID: {entry.id}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`font-mono-num font-bold text-sm ${
                            entry.type === 'PLATFORM_FEE'
                              ? 'text-hope-deep'
                              : isPositive
                              ? 'text-faith-deep'
                              : 'text-danger'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {formatPrice(entry.amount)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 space-y-1">
                        {entry.orderId && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase text-ink-faint font-semibold">Order:</span>
                            <Link
                              href={`/admin/orders`}
                              className="font-mono text-[11px] text-trust hover:underline"
                            >
                              {entry.orderId.slice(-8)}
                            </Link>
                          </div>
                        )}
                        {entry.userId && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase text-ink-faint font-semibold">User:</span>
                            <Link
                              href={`/admin/users`}
                              className="font-mono text-[11px] text-ink-soft hover:underline"
                            >
                              {entry.userId.slice(-8)}
                            </Link>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
                          }}
                          className="h-8 text-xs font-mono text-ink-soft hover:text-ink"
                          title="Copy JSON Payload"
                        >
                          Copy
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-border px-6 py-4">
            <Pagination
              page={page}
              hasMore={page < totalPages}
              onPageChange={setPage}
              total={total}
              limit={20}
            />
          </div>
        )}
      </div>
    </div>
  );
}
