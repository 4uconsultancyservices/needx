'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import {
  Ban,
  CheckCircle2,
  Copy,
  ExternalLink,
  KeyRound,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Undo2,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import type { AdminUserRecord } from '@/hooks/use-admin';
import { useStaffMember, useUpdateStaff } from '@/hooks/use-staff';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate, initials } from '@/lib/utils';
import {
  STAFF_DEPARTMENTS,
  STAFF_MODULES,
  type StaffDepartment,
  type StaffModule,
} from '@needx/types';

const DEPARTMENT_LABELS: Record<StaffDepartment, string> = {
  CUSTOMER_SUPPORT: 'Customer Support',
  TRUST_AND_SAFETY: 'Trust & Safety',
  FINANCE: 'Finance & Treasury',
  OPERATIONS: 'Marketplace Operations',
  CATALOG_TAXONOMY: 'Catalog & Taxonomy',
  EXECUTIVE: 'Executive Management',
};

const MODULE_LABELS: Record<StaffModule, string> = {
  dashboard: 'Command Center',
  users: 'Customer 360 & Profiles',
  staff: 'Staff & Roles (RBAC)',
  needs: 'Needs Pipeline',
  listings: 'Provider Inventory',
  orders: 'Orders & Escrow',
  categories: 'Catalog Taxonomy',
  reports: 'Incident Reports',
  disputes: 'Dispute Arbitration',
  moderation: 'Audit Trail & Moderation',
  reviews: 'CSAT & Reviews',
  payments: 'Treasury & Ledger',
  notifications: 'Broadcast Studio',
  settings: 'System & Engine Settings',
};

interface EmployeeProfileModalProps {
  user: AdminUserRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onBanUser?: (userId: string, reason?: string) => Promise<void>;
  onUnbanUser?: (userId: string) => Promise<void>;
}

export function EmployeeProfileModal({
  user,
  isOpen,
  onClose,
  onBanUser,
  onUnbanUser,
}: EmployeeProfileModalProps) {
  const { data: staffProfile, isLoading: profileLoading } = useStaffMember(user?.id ?? null);
  const updateStaffMutation = useUpdateStaff();

  if (!user) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const isSuspended = Boolean(staffProfile?.isSuspended);
  const isSuperAdmin = user.roles.includes('SUPER_ADMIN');
  const permissions = staffProfile?.permissions || (isSuperAdmin ? ['*'] : []);
  const isWildcard = permissions.includes('*');

  const handleToggleSuspension = async () => {
    if (!user) return;
    try {
      await updateStaffMutation.mutateAsync({
        userId: user.id,
        input: {
          isSuspended: !isSuspended,
        },
      });
      toast.success(
        !isSuspended
          ? `${user.name} has been suspended from staff operations`
          : `${user.name}'s staff privileges are restored`,
      );
    } catch {
      toast.error('Failed to change operator suspension state');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-14 ring-2 ring-trust/30 shrink-0">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-trust text-white text-lg font-bold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="font-display text-lg font-bold text-ink">
                    {user.name}
                  </DialogTitle>
                  <Badge variant="trust" className="text-[10px] font-bold uppercase tracking-wider bg-trust text-white">
                    STAFF OPERATOR
                  </Badge>
                  {isSuperAdmin && (
                    <span className="rounded bg-[#0f294a] px-2 py-0.5 text-[10px] font-bold text-dawn uppercase">
                      Super Admin
                    </span>
                  )}
                  {isSuspended ? (
                    <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-bold text-danger border border-danger/20">
                      OPERATOR SUSPENDED
                    </span>
                  ) : (
                    <span className="rounded-full bg-faith/10 px-2 py-0.5 text-[10px] font-bold text-faith border border-faith/20">
                      ACTIVE OPERATOR
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-faint flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" /> {user.email || 'No email'}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="size-3" /> {user.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {user.city ?? 'Location unset'}
                  </span>
                  <button
                    onClick={() => handleCopy(user.id, 'User ID')}
                    className="flex items-center gap-1 font-mono hover:text-trust"
                    title="Copy User ID"
                  >
                    <Copy className="size-3" /> {user.id.slice(0, 10)}...
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" asChild className="text-xs">
                <Link href="/admin/staff">
                  <ExternalLink className="size-3 mr-1" /> Staff Directory
                </Link>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {profileLoading ? (
          <div className="py-12 text-center text-ink-faint">
            <Loader2 className="size-6 animate-spin mx-auto text-trust" />
            <p className="mt-2 text-xs">Loading employee profile &amp; security credentials...</p>
          </div>
        ) : (
          <div className="space-y-5 pt-3">
            {/* Department & Operational Classification */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-surface p-3.5">
                <p className="text-xs text-ink-faint">Department Division</p>
                <p className="mt-1 font-display text-sm font-bold text-ink">
                  {staffProfile?.department
                    ? DEPARTMENT_LABELS[staffProfile.department] || staffProfile.department
                    : isSuperAdmin
                    ? 'Executive Management'
                    : 'Unassigned'}
                </p>
                <p className="mt-0.5 text-[10px] text-trust font-medium">Enterprise Unit</p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-3.5">
                <p className="text-xs text-ink-faint">Designation Title</p>
                <p className="mt-1 font-display text-sm font-bold text-ink truncate">
                  {staffProfile?.designation || (isSuperAdmin ? 'Super Administrator' : 'Platform Staff')}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-faint">Role: {staffProfile?.role || 'STAFF'}</p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-3.5">
                <p className="text-xs text-ink-faint">Module Grants</p>
                <p className="mt-1 font-display text-sm font-bold text-faith">
                  {isWildcard ? 'Full Access (*)' : `${permissions.length} module grant(s)`}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-faint">Granular permissions</p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-3.5">
                <p className="text-xs text-ink-faint">Last Active Online</p>
                <p className="mt-1 font-display text-xs font-semibold text-ink">
                  {staffProfile?.lastActiveAt ? formatDate(staffProfile.lastActiveAt) : 'Never logged in'}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-faint">Activity heartbeat</p>
              </div>
            </div>

            {/* Assigned Operational Ticket Queues */}
            <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-trust" />
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                  Assigned Operational Queues
                </h4>
              </div>
              <p className="text-xs text-ink-soft">
                Routing queues for incoming customer support tickets, dispute investigations, and escrow disbursements.
              </p>
              {staffProfile?.assignedQueues && staffProfile.assignedQueues.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {staffProfile.assignedQueues.map((queue) => (
                    <span
                      key={queue}
                      className="rounded-md border border-trust/30 bg-trust/10 px-2 py-0.5 font-mono text-xs font-semibold text-trust"
                    >
                      {queue}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink-faint italic pt-1">
                  No specialized queues assigned. Handles general inbound queue.
                </p>
              )}
            </div>

            {/* Granted RBAC Permissions Matrix */}
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 text-dawn" />
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                    Active RBAC Permissions &amp; Module Access
                  </h4>
                </div>
                <Badge variant={isWildcard ? 'faith' : 'outline'} className="text-[10px] font-mono">
                  {isWildcard ? 'ALL MODULES (*)' : `${permissions.length} Grants`}
                </Badge>
              </div>

              {isWildcard ? (
                <div className="rounded-lg border border-faith/30 bg-faith-soft/40 p-3.5 text-xs text-faith">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="size-4 shrink-0" />
                    <span>Unrestricted Master Wildcard Access (*)</span>
                  </div>
                  <p className="mt-1 text-ink-soft text-[11px]">
                    This employee account holds executive administrative authority and can perform all create, read, update, delete, and financial operations across all 14 platform modules.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  {STAFF_MODULES.map((mod) => {
                    const modWildcard = permissions.includes(`${mod}:*`);
                    const modulePerms = permissions.filter((p) => p.startsWith(`${mod}:`));
                    const isGranted = modWildcard || modulePerms.length > 0;

                    return (
                      <div
                        key={mod}
                        className={`rounded-lg border p-2.5 transition-colors ${
                          isGranted
                            ? 'border-trust/40 bg-trust-soft/20'
                            : 'border-border/60 bg-canvas-alt/40 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-ink">{MODULE_LABELS[mod]}</span>
                          {modWildcard ? (
                            <Badge variant="faith" className="text-[9px]">
                              Full Module (*)
                            </Badge>
                          ) : isGranted ? (
                            <Badge variant="trust" className="text-[9px]">
                              {modulePerms.length} Action(s)
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-ink-faint">No Access</span>
                          )}
                        </div>
                        {modulePerms.length > 0 && !modWildcard && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {modulePerms.map((p) => {
                              const action = p.split(':')[1];
                              return (
                                <span
                                  key={p}
                                  className="rounded bg-surface px-1.5 py-0.5 text-[9px] font-mono text-ink border border-border"
                                >
                                  {action}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Operator Status & Security Controls */}
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                Operator Security &amp; Access Controls
              </h4>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-canvas-alt p-3">
                <div>
                  <p className="text-xs font-bold text-ink">Staff Access Privileges</p>
                  <p className="text-[11px] text-ink-soft">
                    {isSuspended
                      ? 'Operator credentials are currently suspended. Staff cannot sign into admin consoles.'
                      : 'Operator credentials are live and authorized for administrative actions.'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={isSuspended ? 'faith' : 'outline'}
                  onClick={handleToggleSuspension}
                  disabled={updateStaffMutation.isPending}
                  className="text-xs shrink-0"
                >
                  {updateStaffMutation.isPending ? (
                    <Loader2 className="size-3 animate-spin mr-1.5" />
                  ) : isSuspended ? (
                    <>
                      <UserCheck className="size-3.5 mr-1 text-faith" />
                      Restore Operator Access
                    </>
                  ) : (
                    <>
                      <UserX className="size-3.5 mr-1 text-danger" />
                      Suspend Operator Access
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-ink-faint">Need to alter department, designation or permissions?</span>
                <Button size="sm" variant="ghost" asChild className="text-xs text-trust hover:underline">
                  <Link href="/admin/staff">Edit in Staff Management &rarr;</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
