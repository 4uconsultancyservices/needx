'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Gavel } from 'lucide-react';
import { useAdminDisputes, useResolveDispute } from '@/hooks/use-admin';
import { AdminResourceTable } from '@/components/admin/admin-resource-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils';

interface DisputeItem {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  createdAt: string;
  resolutionNote?: string;
}

export default function AdminDisputesPage() {
  const { data, isLoading } = useAdminDisputes({ page: 1, limit: 30 });
  const resolve = useResolveDispute();
  const [target, setTarget] = useState<{ id: string; status: string } | null>(null);
  const [note, setNote] = useState('');

  return (
    <div className="space-y-6">
      {/* CRM Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Dispute Arbitration Workbench
            </h1>
            <Badge variant="danger" className="text-xs">Escrow Releases</Badge>
          </div>
          <p className="mt-1 text-xs text-ink-soft sm:text-sm">
            Investigate order conflicts, assess claims, and execute legally-binding escrow disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 font-mono-num text-xs">
            {data?.items?.length ?? 0} Recorded Cases
          </Badge>
        </div>
      </div>

      {/* CRM Table */}
      <AdminResourceTable<DisputeItem>
        items={data?.items as DisputeItem[] | undefined}
        isLoading={isLoading}
        getRowKey={(d) => d.id}
        emptyMessage="Zero disputes on record. Escrow integrity 100%."
        columns={[
          {
            header: 'Escrow Case ID',
            render: (d) => (
              <div>
                <span className="font-mono text-xs font-bold text-ink">
                  #{d.id.slice(-8).toUpperCase()}
                </span>
                <span className="block font-mono text-[11px] text-ink-faint">
                  Order: #{String(d.orderId).slice(-6).toUpperCase()}
                </span>
              </div>
            ),
          },
          {
            header: 'Dispute Rationale',
            render: (d) => (
              <span className="text-xs font-medium text-ink max-w-sm block">
                {d.reason}
              </span>
            ),
          },
          {
            header: 'Case Status',
            render: (d) => (
              <Badge
                variant={
                  d.status === 'OPEN'
                    ? 'danger'
                    : d.status.startsWith('RESOLVED')
                    ? 'faith'
                    : 'default'
                }
                className="text-[10px]"
              >
                {d.status.replace('_', ' ')}
              </Badge>
            ),
          },
          {
            header: 'Filed Timestamp',
            render: (d) => (
              <span className="font-mono text-xs text-ink-faint">
                {formatDate(d.createdAt)}
              </span>
            ),
          },
          {
            header: 'Arbitration Decision',
            render: (d) =>
              ['OPEN', 'REVIEWING'].includes(d.status) ? (
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setTarget({ id: d.id, status: 'RESOLVED_BUYER' })}
                    className="h-7 text-[11px] px-2"
                  >
                    Refund Buyer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTarget({ id: d.id, status: 'RESOLVED_PROVIDER' })}
                    className="h-7 text-[11px] px-2"
                  >
                    Release to Provider
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTarget({ id: d.id, status: 'CLOSED' })}
                    className="h-7 text-[11px] px-2"
                  >
                    Dismiss
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-ink-soft">
                  <span className="font-semibold text-faith">Resolved</span>
                  {d.resolutionNote && (
                    <span className="block text-[11px] text-ink-faint italic line-clamp-1">
                      &quot;{d.resolutionNote}&quot;
                    </span>
                  )}
                </div>
              ),
          },
        ]}
      />

      {/* Arbitration Modal */}
      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="size-5 text-trust" />
              Confirm Arbitration Ruling
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-ink-soft">
              You are resolving this dispute as <strong className="text-ink">{target?.status.replace('_', ' ')}</strong>.
              This will disburse held escrow funds and close the active complaint.
            </p>
            <div>
              <Label className="text-xs">Arbitration Resolution Note</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Explain the legal / terms rationale for this decision..."
                className="mt-1 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              disabled={!note.trim()}
              loading={resolve.isPending}
              onClick={async () => {
                if (!target) return;
                await resolve.mutateAsync({ id: target.id, status: target.status, resolutionNote: note });
                toast.success('Dispute ruling executed');
                setTarget(null);
                setNote('');
              }}
            >
              Execute Ruling
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
