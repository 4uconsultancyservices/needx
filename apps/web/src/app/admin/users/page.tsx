'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Ban,
  Building2,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Star,
  Undo2,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  useAdminUsers,
  useBanUser,
  useUnbanUser,
  useSetUserRoles,
  useAdminToggleProvider,
  type AdminUserRecord,
} from '@/hooks/use-admin';
import { isUserProvider } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { AdminResourceTable } from '@/components/admin/admin-resource-table';
import { EmployeeProfileModal } from '@/components/admin/employee-profile-modal';
import { Customer360Modal } from '@/components/admin/customer-360-modal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pagination } from '@/components/shared/pagination';
import { formatDate, initials } from '@/lib/utils';
import type { Role } from '@needx/types';

export default function AdminUsersPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMERS' | 'STAFF' | 'PROVIDERS' | 'BANNED'>('ALL');

  // Separated modal targets
  const [selectedCustomerUser, setSelectedCustomerUser] = useState<AdminUserRecord | null>(null);
  const [selectedEmployeeUser, setSelectedEmployeeUser] = useState<AdminUserRecord | null>(null);

  const debouncedQ = useDebounce(q);
  const { data, isLoading, refetch, isFetching } = useAdminUsers({
    page,
    limit: 20,
    q: debouncedQ || undefined,
  });

  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const setRoles = useSetUserRoles();
  const toggleProvider = useAdminToggleProvider();

  const isStaffUser = (u: AdminUserRecord) =>
    u.roles.includes('STAFF') ||
    u.roles.includes('ADMIN') ||
    u.roles.includes('SUPER_ADMIN') ||
    u.roles.includes('MODERATOR');

  const filteredUsers = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((u) => {
      if (roleFilter === 'BANNED') return u.isBanned;
      if (roleFilter === 'STAFF') return isStaffUser(u);
      if (roleFilter === 'CUSTOMERS') return !isStaffUser(u);
      if (roleFilter === 'PROVIDERS') return isUserProvider(u);
      return true;
    });
  }, [data?.data, roleFilter]);

  const customerCount = useMemo(
    () => (data?.data ?? []).filter((u) => !isStaffUser(u)).length,
    [data?.data],
  );
  const staffCount = useMemo(
    () => (data?.data ?? []).filter((u) => isStaffUser(u)).length,
    [data?.data],
  );
  const providerCount = useMemo(
    () => (data?.data ?? []).filter((u) => isUserProvider(u)).length,
    [data?.data],
  );
  const bannedCount = useMemo(
    () => (data?.data ?? []).filter((u) => u.isBanned).length,
    [data?.data],
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const handleQuickUnban = async (userId: string) => {
    try {
      await unbanUser.mutateAsync(userId);
      toast.success('Account reinstated successfully');
      refetch();
    } catch {
      toast.error('Failed to reinstate account');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
              User &amp; Identity Management
            </h1>
            <Badge variant="trust" className="text-xs">
              CRM 360
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Directory of platform customers and internal operating personnel with separate profile inspectors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs"
          >
            <RefreshCw className={`mr-1.5 size-3.5 ${isFetching ? 'animate-spin text-trust' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* User Registry Table with Reusable Dynamic Features */}
      <AdminResourceTable<AdminUserRecord>
        title="Account & Profile Directory"
        description="Search, filter, inspect, and perform bulk operations on platform customers and employee records."
        icon={Users}
        items={filteredUsers}
        getRowKey={(u) => u.id}
        isLoading={isLoading}
        emptyMessage="No account records match your filter criteria."
        searchValue={q}
        onSearchChange={(nextQ) => {
          setQ(nextQ);
          setPage(1);
        }}
        searchPlaceholder="Search accounts by name, email, phone, or city..."
        serverSideSearch={true}
        quickTabs={[
          { id: 'ALL', label: 'All Users', count: data?.meta?.total ?? 0 },
          { id: 'CUSTOMERS', label: 'Customers', count: customerCount },
          { id: 'STAFF', label: 'Employees & Staff', count: staffCount },
          { id: 'PROVIDERS', label: 'Providers', count: providerCount },
          { id: 'BANNED', label: 'Suspended', count: bannedCount },
        ]}
        activeTab={roleFilter}
        onTabChange={(tabId) => setRoleFilter(tabId as typeof roleFilter)}
        facetFilters={[
          {
            id: 'status',
            title: 'Account Status',
            options: [
              { label: 'Active Only', value: 'active', count: (data?.data ?? []).filter((u) => !u.isBanned).length },
              { label: 'Suspended', value: 'suspended', count: bannedCount },
            ],
          },
        ]}
        page={page}
        pageSize={20}
        totalItems={data?.meta?.total ?? 0}
        onPageChange={setPage}
        serverSidePagination={true}
        selectable={true}
        exportable={true}
        exportFilename="needx_users_directory"
        batchActions={[
          {
            id: 'export-selected',
            label: 'Export CSV',
            icon: ExternalLink,
            onClick: (selected) => {
              const rows = [
                ['ID', 'Name', 'Email', 'Phone', 'City', 'Roles', 'Suspended'].join(','),
                ...selected.map((u) =>
                  [
                    u.id,
                    `"${(u.name || '').replace(/"/g, '""')}"`,
                    u.email ?? '',
                    u.phone ?? '',
                    u.city ?? '',
                    `"${u.roles.join(';')}"`,
                    u.isBanned ? 'YES' : 'NO',
                  ].join(','),
                ),
              ].join('\n');
              const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `selected_users_${Date.now()}.csv`;
              link.click();
              URL.revokeObjectURL(url);
              toast.success(`Exported ${selected.length} records to CSV`);
            },
          },
          {
            id: 'copy-ids',
            label: 'Copy User IDs',
            icon: Copy,
            onClick: (selected) => {
              const ids = selected.map((u) => u.id).join('\n');
              navigator.clipboard.writeText(ids);
              toast.success(`Copied ${selected.length} user IDs`);
            },
          },
          {
            id: 'bulk-suspend',
            label: 'Suspend Selected',
            icon: Ban,
            variant: 'destructive',
            onClick: async (selected) => {
              const activeOnly = selected.filter((u) => !u.isBanned);
              if (activeOnly.length === 0) {
                toast.info('Selected users are already suspended');
                return;
              }
              try {
                await Promise.all(
                  activeOnly.map((u) =>
                    banUser.mutateAsync({ id: u.id, reason: 'Bulk admin suspension' }),
                  ),
                );
                toast.success(`Suspended ${activeOnly.length} user account(s)`);
                refetch();
              } catch {
                toast.error('Failed to suspend some accounts');
              }
            },
          },
        ]}
        columns={[
          {
            id: 'name',
            header: 'Profile & Identity',
            sortable: true,
            accessorFn: (u) => u.name,
            render: (u) => (
              <div className="flex items-center gap-3">
                <Avatar className="size-9 ring-1 ring-border shrink-0">
                  <AvatarImage src={u.avatarUrl} alt={u.name} />
                  <AvatarFallback className="bg-trust text-white text-xs font-bold">
                    {initials(u.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 max-w-[200px]">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs font-bold truncate ${u.isBanned ? 'line-through text-danger' : 'text-ink'}`}>
                      {u.name}
                    </p>
                    {u.isBanned && (
                      <span className="rounded bg-danger/10 px-1 py-0.2 text-[9px] font-bold text-danger">
                        SUSPENDED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-ink-faint truncate">
                    <Mail className="size-2.5 shrink-0" />
                    <span className="truncate">{u.email || 'No email stored'}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(u.id, 'User ID');
                    }}
                    className="flex items-center gap-1 text-[10px] text-ink-faint hover:text-trust font-mono truncate"
                    title="Click to copy ID"
                  >
                    <span>ID: {u.id.slice(0, 8)}...</span>
                    <Copy className="size-2.5 opacity-60" />
                  </button>
                </div>
              </div>
            ),
          },
          {
            id: 'location',
            header: 'Location & Hub',
            sortable: true,
            accessorFn: (u) => u.city || '',
            render: (u) => (
              <div className="space-y-0.5 text-xs">
                <span className="flex items-center gap-1 text-ink-soft">
                  <MapPin className="size-3 text-ink-faint shrink-0" />
                  {u.city ?? '—'}
                </span>
                {u.phone ? (
                  <a
                    href={`tel:${u.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[11px] text-ink-faint hover:text-trust font-mono"
                  >
                    <Phone className="size-2.5 shrink-0" />
                    <span>{u.phone}</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-ink-faint">No phone</span>
                )}
              </div>
            ),
          },
          {
            id: 'roles',
            header: 'Roles & Classification',
            render: (u) => {
              const isStaff = isStaffUser(u);
              const isProv = isUserProvider(u);
              const isSuper = u.roles.includes('SUPER_ADMIN');
              const isAdmin = u.roles.includes('ADMIN');
              return (
                <div className="flex flex-wrap gap-1 max-w-[190px]">
                  {isSuper && (
                    <Badge variant="trust" className="bg-[#0f294a] text-dawn text-[9px] font-bold uppercase">
                      SUPER ADMIN
                    </Badge>
                  )}
                  {isAdmin && !isSuper && (
                    <Badge variant="trust" className="bg-trust text-white text-[9px] font-bold uppercase">
                      ADMIN
                    </Badge>
                  )}
                  {u.roles.includes('STAFF') && (
                    <Badge variant="outline" className="border-trust/60 text-trust bg-trust/5 text-[9px] font-semibold">
                      STAFF OPERATOR
                    </Badge>
                  )}
                  {u.roles.includes('MODERATOR') && (
                    <Badge variant="outline" className="border-faith/60 text-faith bg-faith/5 text-[9px] font-semibold">
                      MODERATOR
                    </Badge>
                  )}
                  {isProv && (
                    <Badge variant="hope" className="text-[9px] font-bold uppercase">
                      PROVIDER
                    </Badge>
                  )}
                  {!isStaff && !isProv && (
                    <Badge variant="outline" className="text-[9px] text-ink-soft">
                      CUSTOMER / BUYER
                    </Badge>
                  )}
                  {u.provider?.businessName && (
                    <span className="block w-full text-[10px] text-ink-faint truncate font-medium">
                      🏢 {u.provider.businessName}
                    </span>
                  )}
                </div>
              );
            },
          },
          {
            id: 'trust',
            header: 'Trust Score',
            sortable: true,
            accessorFn: (u) => u.trust?.ratingAverage ?? 5.0,
            render: (u) => (
              <div className="space-y-0.5">
                <div className="flex items-center text-amber-500 font-bold text-xs">
                  <Star className="size-3 fill-amber-400 text-amber-400 mr-0.5" />
                  {u.trust?.ratingAverage ? u.trust.ratingAverage.toFixed(1) : '5.0'}
                  <span className="ml-1 text-[10px] text-ink-faint font-normal">
                    ({u.trust?.ratingCount ?? 0})
                  </span>
                </div>
                <p className="text-[10px] text-ink-faint">
                  {u.trust?.completedTransactions ?? 0} deals completed
                </p>
              </div>
            ),
          },
          {
            id: 'status',
            header: 'Status',
            sortable: true,
            accessorFn: (u) => (u.isBanned ? 'Suspended' : 'Active'),
            render: (u) => (
              <div>
                {u.isBanned ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
                    <span className="size-1.5 rounded-full bg-danger animate-pulse" />
                    Suspended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-faith/30 bg-faith/10 px-2 py-0.5 text-[10px] font-semibold text-faith">
                    <span className="size-1.5 rounded-full bg-faith" />
                    Active
                  </span>
                )}
              </div>
            ),
          },
          {
            id: 'createdAt',
            header: 'Joined',
            sortable: true,
            accessorFn: (u) => u.createdAt,
            render: (u) => (
              <span className="text-xs text-ink-faint font-mono">
                {formatDate(u.createdAt)}
              </span>
            ),
          },
          {
            id: 'actions',
            header: 'CRM Actions',
            render: (u) => {
              const isStaff = isStaffUser(u);
              return (
                <div className="flex items-center gap-1.5">
                  {isStaff ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployeeUser(u);
                      }}
                      className="h-8 text-xs px-2.5 font-semibold text-trust hover:bg-trust-soft/50 border-trust/40"
                    >
                      <Shield className="size-3 mr-1 text-trust" /> Employee Profile
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomerUser(u);
                      }}
                      className="h-8 text-xs px-2.5 font-semibold text-ink-soft hover:bg-canvas-alt"
                    >
                      <UserCheck className="size-3 mr-1 text-trust" /> Customer 360
                    </Button>
                  )}

                  {u.isBanned && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickUnban(u.id);
                      }}
                      className="h-8 text-xs px-2 text-faith hover:bg-faith/10"
                      title="Reinstate Account"
                    >
                      <Undo2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              );
            },
          },
        ]}
      />

      {/* SEPARATE MODAL 1: Dedicated Employee Profile Modal */}
      <EmployeeProfileModal
        user={selectedEmployeeUser}
        isOpen={Boolean(selectedEmployeeUser)}
        onClose={() => setSelectedEmployeeUser(null)}
        onBanUser={async (userId, reason) => {
          await banUser.mutateAsync({ id: userId, reason: reason || 'Staff sanction' });
          setSelectedEmployeeUser(null);
          refetch();
        }}
        onUnbanUser={async (userId) => {
          await unbanUser.mutateAsync(userId);
          refetch();
        }}
      />

      {/* SEPARATE MODAL 2: Dedicated Customer 360 Modal */}
      <Customer360Modal
        user={selectedCustomerUser}
        isOpen={Boolean(selectedCustomerUser)}
        onClose={() => setSelectedCustomerUser(null)}
        onBanUser={async (userId, reason) => {
          await banUser.mutateAsync({ id: userId, reason: reason || 'Customer sanction' });
          setSelectedCustomerUser(null);
          refetch();
        }}
        onUnbanUser={async (userId) => {
          await unbanUser.mutateAsync(userId);
          refetch();
        }}
        onToggleProvider={async (targetUser, makeProvider) => {
          await toggleProvider.mutateAsync({
            id: targetUser.id,
            isProvider: makeProvider,
            providerType: 'INDIVIDUAL',
          });
          refetch();
        }}
        onToggleRole={async (targetUser, role) => {
          const has = targetUser.roles.includes(role);
          const nextRoles = has
            ? targetUser.roles.filter((r) => r !== role)
            : [...targetUser.roles, role];
          await setRoles.mutateAsync({ id: targetUser.id, roles: nextRoles });
          refetch();
        }}
      />
    </div>
  );
}
