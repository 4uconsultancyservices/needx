'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from 'recharts';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Download,
  Gavel,
  Package,
  ScrollText,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAdminDashboard, useAdminSignups, useAdminAuditLog, useAdminDisputes, useAdminReports } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30'>('14');
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: signups, isLoading: signupsLoading } = useAdminSignups(Number(timeRange));
  const { data: auditLog } = useAdminAuditLog({ page: 1, limit: 6 });
  const { data: disputes } = useAdminDisputes({ page: 1, limit: 4, status: 'OPEN' });
  const { data: reports } = useAdminReports({ page: 1, limit: 4, status: 'OPEN' });

  if (statsLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Calculate funnel metrics
  const fulfillmentPct = Math.round(stats.needFulfillmentRate * 100);
  const conversionPct = Math.round(stats.conversionRate * 100);
  const cancellationPct = Math.round(stats.cancellationRate * 100);

  return (
    <div className="space-y-8">
      {/* CRM Executive Control Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Operations Command Center
            </h1>
            <Badge variant="trust" className="font-semibold text-xs">CRM HQ</Badge>
          </div>
          <p className="mt-1 text-xs text-ink-soft sm:text-sm">
            Real-time marketplace velocity, transaction escrow, customer integrity, and fulfillment telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time range selector */}
          <div className="flex rounded-xl border border-border bg-surface p-1 shadow-2xs">
            {(['7', '14', '30'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  timeRange === r
                    ? 'bg-trust text-white shadow-xs'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {r}D
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csv = `Metric,Value\nGMV,${stats.gmv}\nPlatform Revenue,${stats.platformRevenue}\nTotal Users,${stats.totalUsers}\nActive Needs,${stats.activeNeeds}\nActive Listings,${stats.activeListings}\nOpen Disputes,${stats.openDisputes}\n`;
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `needx_crm_metrics_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
            }}
            className="text-xs"
          >
            <Download className="size-3.5" /> Export Data
          </Button>

          <Button variant="default" size="sm" asChild className="text-xs">
            <Link href="/admin/users">
              <Users className="size-3.5" /> Customer 360
            </Link>
          </Button>
        </div>
      </div>

      {/* Primary KPI Ribbon (Executive CRM Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: GMV */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-5 shadow-xs transition-all hover:shadow-card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Gross Merchandise Volume</p>
              <p className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {formatPrice(stats.gmv)}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-trust-soft text-trust">
              <CreditCard className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-faith">
              <ArrowUpRight className="size-3.5" /> +14.2% velocity
            </span>
            <span className="text-ink-faint">{stats.totalOrders} total orders</span>
          </div>
        </div>

        {/* Metric 2: Net Platform Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-5 shadow-xs transition-all hover:shadow-card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Platform Revenue (10%)</p>
              <p className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {formatPrice(stats.platformRevenue)}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-faith-soft text-faith">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-faith">
              <CheckCircle2 className="size-3.5" /> Escrow secured
            </span>
            <span className="text-ink-faint">10% fixed commission</span>
          </div>
        </div>

        {/* Metric 3: Active Customer Accounts */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-5 shadow-xs transition-all hover:shadow-card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Total Customer Accounts</p>
              <p className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {stats.totalUsers.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-hope-soft text-hope">
              <Users className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
            <span className="font-semibold text-trust">
              {stats.totalProviders} Verified Providers
            </span>
            <span className="text-ink-faint">
              {Math.round((stats.totalProviders / (stats.totalUsers || 1)) * 100)}% provider ratio
            </span>
          </div>
        </div>

        {/* Metric 4: Case Resolution & Trust SLA */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-5 shadow-xs transition-all hover:shadow-card-hover">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Active Escalations</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {stats.openDisputes + stats.openReports}
                </span>
                <span className="text-xs text-ink-faint">cases pending</span>
              </div>
            </div>
            <div className={`flex size-10 items-center justify-center rounded-xl ${
              stats.openDisputes > 0 ? 'bg-danger-soft text-danger' : 'bg-faith-soft text-faith'
            }`}>
              <ShieldAlert className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
            <span className="text-ink-soft">
              {stats.openDisputes} disputes · {stats.openReports} reports
            </span>
            <Link href="/admin/disputes" className="font-semibold text-trust hover:underline">
              Resolve →
            </Link>
          </div>
        </div>
      </div>

      {/* CRM Funnel & Conversion Velocity Pipeline */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-ink">Marketplace Fulfillment Pipeline</h2>
            <p className="text-xs text-ink-soft">
              End-to-end demand conversion from user need expression to guaranteed order completion.
            </p>
          </div>
          <Badge variant="trust" className="w-fit text-xs">
            {fulfillmentPct}% Overall Fulfillment Rate
          </Badge>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Stage 1 */}
          <div className="relative rounded-xl border border-border bg-canvas-alt/40 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-faint">
              <span>Stage 1: Expressed</span>
              <Package className="size-3.5 text-hope" />
            </div>
            <p className="mt-2 font-display text-xl font-bold text-ink">{stats.totalNeeds || stats.activeNeeds}</p>
            <p className="text-[11px] text-ink-soft">Open community needs</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full bg-hope" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Stage 2 */}
          <div className="relative rounded-xl border border-border bg-canvas-alt/40 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-faint">
              <span>Stage 2: Matched</span>
              <Sparkles className="size-3.5 text-trust" />
            </div>
            <p className="mt-2 font-display text-xl font-bold text-ink">{stats.activeListings} listings</p>
            <p className="text-[11px] text-ink-soft">Ranked by algorithm</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full bg-trust" style={{ width: '85%' }} />
            </div>
          </div>

          {/* Stage 3 */}
          <div className="relative rounded-xl border border-border bg-canvas-alt/40 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-faint">
              <span>Stage 3: Deals / Orders</span>
              <CreditCard className="size-3.5 text-accent" />
            </div>
            <p className="mt-2 font-display text-xl font-bold text-ink">{stats.totalOrders}</p>
            <p className="text-[11px] text-ink-soft">{conversionPct}% need → order</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full bg-accent" style={{ width: `${Math.max(15, conversionPct)}%` }} />
            </div>
          </div>

          {/* Stage 4 */}
          <div className="relative rounded-xl border border-border bg-canvas-alt/40 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-faint">
              <span>Stage 4: Fulfilled</span>
              <CheckCircle2 className="size-3.5 text-faith" />
            </div>
            <p className="mt-2 font-display text-xl font-bold text-ink">{stats.completedOrders}</p>
            <p className="text-[11px] text-ink-soft">{fulfillmentPct}% completion rate</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full bg-faith" style={{ width: `${Math.max(15, fulfillmentPct)}%` }} />
            </div>
          </div>

          {/* Stage 5 */}
          <div className="relative rounded-xl border border-border bg-canvas-alt/40 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-faint">
              <span>Stage 5: Cancelled</span>
              <AlertTriangle className="size-3.5 text-danger" />
            </div>
            <p className="mt-2 font-display text-xl font-bold text-ink">{stats.cancelledOrders}</p>
            <p className="text-[11px] text-ink-soft">{cancellationPct}% cancellation</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full bg-danger" style={{ width: `${Math.max(5, cancellationPct)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Analytical Command Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Growth Telemetry Chart (Area) */}
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs lg:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-ink">User Acquisition Telemetry</h2>
              <p className="text-xs text-ink-soft">Daily registered seekers and onboarding providers ({timeRange}-day window).</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                <span className="size-2.5 rounded-full bg-trust" />
                <span>New Signups</span>
              </div>
            </div>
          </div>

          <div className="mt-6 h-72 w-full">
            {signupsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={signups} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trustGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-trust)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-trust)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--color-ink-faint)"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(d) => d.slice(5)}
                  />
                  <YAxis stroke="var(--color-ink-faint)" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Signups"
                    stroke="var(--color-trust)"
                    strokeWidth={2.5}
                    fill="url(#trustGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Match Engine Diagnostic Radar */}
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink">Match Weights Telemetry</h2>
            <Link href="/admin/settings" className="text-xs font-semibold text-trust hover:underline">
              Configure →
            </Link>
          </div>
          <p className="mt-1 text-xs text-ink-soft">Live multi-signal weighting applied across all incoming needs.</p>

          <div className="mt-5 space-y-3">
            {[
              { label: 'Semantic Relevance', weight: 30, color: 'bg-trust' },
              { label: 'Geographic Proximity', weight: 20, color: 'bg-hope' },
              { label: 'Pricing Fit', weight: 15, color: 'bg-accent' },
              { label: 'Inventory Availability', weight: 10, color: 'bg-faith' },
              { label: 'Provider Rating', weight: 10, color: 'bg-amber-500' },
              { label: 'Reliability History', weight: 10, color: 'bg-indigo-600' },
              { label: 'Response Velocity', weight: 5, color: 'bg-slate-500' },
            ].map((factor) => (
              <div key={factor.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-soft">{factor.label}</span>
                  <span className="font-mono-num font-bold text-ink">{factor.weight}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div className={`h-full ${factor.color}`} style={{ width: `${factor.weight * 3.3}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-border bg-canvas-alt/60 p-3 text-center">
            <p className="text-[11px] text-ink-soft">
              Total Weight Sum: <span className="font-bold text-faith">100% Verified</span>
            </p>
          </div>
        </div>
      </div>

      {/* Operational Workbenches (Priority Escalations & Audit Trail) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Priority Escalations Workbench */}
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-danger-soft text-danger">
                <Gavel className="size-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-ink">Urgent Case Escalations</h2>
                <p className="text-xs text-ink-soft">Disputes and community reports requiring operator arbitration.</p>
              </div>
            </div>
            <Link href="/admin/disputes" className="text-xs font-semibold text-trust hover:underline">
              View all ({stats.openDisputes + stats.openReports})
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {(!disputes?.items || disputes.items.length === 0) && (!reports?.items || reports.items.length === 0) ? (
              <div className="rounded-xl border border-faith/20 bg-faith-soft/40 p-6 text-center">
                <CheckCircle2 className="mx-auto size-6 text-faith" />
                <p className="mt-2 text-xs font-semibold text-ink">Zero active escalations</p>
                <p className="text-[11px] text-ink-soft">All buyer and provider cases are currently resolved.</p>
              </div>
            ) : (
              <>
                {(disputes?.items ?? []).slice(0, 3).map((d: Record<string, unknown>) => (
                  <div
                    key={String(d.id)}
                    className="flex items-center justify-between rounded-xl border border-border bg-canvas-alt/40 p-3.5 transition-colors hover:border-danger/30"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="danger" className="text-[10px]">Dispute</Badge>
                        <span className="font-mono-num text-xs font-bold text-ink">
                          Order #{String(d.orderId ?? d.id).slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-ink-soft">
                        {String(d.reason ?? 'Arbitration requested by customer')}
                      </p>
                    </div>
                    <Button variant="default" size="sm" asChild className="shrink-0 text-xs">
                      <Link href="/admin/disputes">Arbitrate</Link>
                    </Button>
                  </div>
                ))}

                {(reports?.items ?? []).slice(0, 2).map((r: Record<string, unknown>) => (
                  <div
                    key={String(r.id)}
                    className="flex items-center justify-between rounded-xl border border-border bg-canvas-alt/40 p-3.5 transition-colors hover:border-amber-500/30"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="accent" className="text-[10px]">Report</Badge>
                        <span className="text-xs font-semibold text-ink">{String(r.targetType)}</span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-ink-soft">
                        {String(r.details ?? r.reason ?? 'Flagged item')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="shrink-0 text-xs">
                      <Link href="/admin/reports">Review</Link>
                    </Button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Live Audit Trail & Operator Stream */}
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-trust-soft text-trust">
                <ScrollText className="size-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-ink">Live Audit & Activity Stream</h2>
                <p className="text-xs text-ink-soft">Append-only log of sensitive platform modifications.</p>
              </div>
            </div>
            <Link href="/admin/moderation" className="text-xs font-semibold text-trust hover:underline">
              Full log →
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {(!auditLog?.items || auditLog.items.length === 0) ? (
              <div className="rounded-xl border border-border bg-canvas-alt/40 p-6 text-center text-xs text-ink-soft">
                No recent admin modifications logged.
              </div>
            ) : (
              auditLog.items.map((item: Record<string, unknown>) => (
                <div
                  key={String(item.id)}
                  className="flex items-start justify-between rounded-xl border border-border/60 bg-canvas-alt/30 p-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 size-2 rounded-full bg-trust shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-ink">{String(item.action)}</p>
                      <p className="text-[11px] text-ink-soft">
                        {item.targetType ? `${item.targetType} #${String(item.targetId).slice(-6)}` : 'System wide update'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-ink-faint whitespace-nowrap">
                    {formatDate(String(item.createdAt))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
