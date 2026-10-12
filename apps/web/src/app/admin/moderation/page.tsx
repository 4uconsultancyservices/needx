'use client';

import { Lock } from 'lucide-react';
import { useAdminAuditLog } from '@/hooks/use-admin';
import { AdminResourceTable } from '@/components/admin/admin-resource-table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface AuditLogItem {
  id: string;
  action: string;
  targetType?: string;
  targetId?: string;
  createdAt: string;
}

export default function AdminModerationLogPage() {
  const { data, isLoading } = useAdminAuditLog({ page: 1, limit: 50 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Audit Trail & Immutable Stream
            </h1>
            <Badge variant="trust" className="text-xs">
              <Lock className="size-2.5 mr-1" /> Append-Only
            </Badge>
          </div>
          <p className="mt-1 text-xs text-ink-soft sm:text-sm">
            Complete compliance trail: operator bans, role grants, listing moderation, and dispute rulings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 font-mono-num text-xs">
            {data?.total ?? data?.items?.length ?? 0} Recorded Events
          </Badge>
        </div>
      </div>

      {/* CRM Table */}
      <AdminResourceTable<AuditLogItem>
        items={data?.items as AuditLogItem[] | undefined}
        isLoading={isLoading}
        getRowKey={(a) => a.id}
        emptyMessage="No audit trail events recorded in cluster yet."
        columns={[
          {
            header: 'Security Action',
            render: (a) => (
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-trust shrink-0" />
                <Badge
                  variant={
                    a.action.includes('BAN')
                      ? 'danger'
                      : a.action.includes('ROLE')
                      ? 'trust'
                      : a.action.includes('RESOLVE')
                      ? 'faith'
                      : 'outline'
                  }
                  className="font-mono text-[10px]"
                >
                  {a.action}
                </Badge>
              </div>
            ),
          },
          {
            header: 'Target Entity',
            render: (a) => (
              <span className="font-mono text-xs text-ink">
                {a.targetType ? `${a.targetType} #${String(a.targetId).slice(-8).toUpperCase()}` : 'System Wide'}
              </span>
            ),
          },
          {
            header: 'Timestamp',
            render: (a) => (
              <span className="font-mono text-xs text-ink-faint">
                {formatDate(a.createdAt)}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
