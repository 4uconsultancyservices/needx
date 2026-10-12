'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminReports, useResolveReport } from '@/hooks/use-admin';
import { AdminResourceTable } from '@/components/admin/admin-resource-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface ReportItem {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string;
  createdAt: string;
  resolutionNote?: string;
}

export default function AdminReportsPage() {
  const [status, setStatus] = useState('OPEN');
  const { data, isLoading } = useAdminReports({ page: 1, limit: 30, status });
  const resolve = useResolveReport();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Trust Sentinel & Incident Reports
            </h1>
            <Badge variant="accent" className="text-xs">Community Moderation</Badge>
          </div>
          <p className="mt-1 text-xs text-ink-soft sm:text-sm">
            Investigate suspicious listings, abusive communication, fraudulent claims, and policy violations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 font-mono-num text-xs">
            {data?.total ?? 0} Total Incidents
          </Badge>
        </div>
      </div>

      {/* Status Segment Filters */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-border/80 bg-surface p-1 shadow-xs">
        {[
          { id: 'OPEN', label: 'Open Investigation' },
          { id: 'RESOLVED', label: 'Action Taken / Resolved' },
          { id: 'REJECTED', label: 'Dismissed / False Alarm' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatus(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              status === tab.id
                ? 'bg-trust text-white shadow-xs'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CRM Table */}
      <AdminResourceTable<ReportItem>
        items={data?.items as ReportItem[] | undefined}
        isLoading={isLoading}
        getRowKey={(r) => r.id}
        emptyMessage={`Zero ${status.toLowerCase()} incident reports.`}
        columns={[
          {
            header: 'Target Entity',
            render: (r) => (
              <div>
                <span className="font-bold text-ink text-xs">{r.targetType}</span>
                <span className="block font-mono text-[11px] text-ink-faint">
                  #{String(r.targetId).slice(-8).toUpperCase()}
                </span>
              </div>
            ),
          },
          {
            header: 'Infraction Reason',
            render: (r) => <Badge variant="danger" className="text-[10px]">{r.reason}</Badge>,
          },
          {
            header: 'Incident Details',
            render: (r) => (
              <span className="line-clamp-2 max-w-sm text-xs text-ink-soft">
                {r.details || 'No additional narrative provided.'}
              </span>
            ),
          },
          {
            header: 'Filed',
            render: (r) => (
              <span className="font-mono text-xs text-ink-faint">
                {formatDate(r.createdAt)}
              </span>
            ),
          },
          {
            header: 'Operator Action',
            render: (r) =>
              status === 'OPEN' ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={async () => {
                      await resolve.mutateAsync({ id: r.id, action: 'resolve' });
                      toast.success('Report resolved and policy action enforced');
                    }}
                    className="h-7 text-xs px-2.5"
                  >
                    Take Action
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await resolve.mutateAsync({ id: r.id, action: 'reject' });
                      toast('Report dismissed');
                    }}
                    className="h-7 text-xs text-ink-soft px-2.5"
                  >
                    Dismiss
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-ink-faint italic">
                  {r.resolutionNote || 'Case closed'}
                </span>
              ),
          },
        ]}
      />
    </div>
  );
}
