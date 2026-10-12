'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Ban,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Undo2,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react';
import {
  useAdminUsers,
  useAdminUserDossier,
  useBanUser,
  useUnbanUser,
  useSetUserRoles,
  useAdminToggleProvider,
  useAdminUpdateUserTrust,
  type AdminUserRecord,
} from '@/hooks/use-admin';
import { isUserProvider } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { AdminResourceTable } from '@/components/admin/admin-resource-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pagination } from '@/components/shared/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate, formatPrice, initials, ORDER_STATUS_LABELS } from '@/lib/utils';
import type { Role } from '@needx/types';

export default function AdminUsersPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PROVIDER' | 'USER' | 'ADMIN' | 'BANNED'>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');
  const [showBanInput, setShowBanInput] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState('overview');

  const debouncedQ = useDebounce(q);
  const { data, isLoading, refetch } = useAdminUsers({ page, limit: 20, q: debouncedQ || undefined });
  const { data: dossier, isLoading: dossierLoading } = useAdminUserDossier(selectedUserId);

  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const setRoles = useSetUserRoles();
  const toggleProvider = useAdminToggleProvider();
  const updateTrust = useAdminUpdateUserTrust();

  // Find user record either from list or dossier
  const currentUserRecord =
    (dossier?.user as AdminUserRecord | undefined) ??
    data?.data?.find((u) => u.id === selectedUserId);

  // Client-side quick filter
  const filteredUsers = (data?.data ?? []).filter((u) => {
    if (roleFilter === 'ALL') return true;
    if (roleFilter === 'BANNED') return Boolean(u.isBanned);
    if (roleFilter === 'PROVIDER') return isUserProvider(u);
    if (roleFilter === 'ADMIN') return u.roles.includes('ADMIN') || u.roles.includes('SUPER_ADMIN');
    if (roleFilter === 'USER') return !u.roles.includes('ADMIN') && !u.roles.includes('SUPER_ADMIN') && !isUserProvider(u);
    return true;
  });

  const handleCopy = (text: string, label = 'Copied') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleToggleProvider = async (targetUser: AdminUserRecord, nextStatus: boolean) => {
    try {
      await toggleProvider.mutateAsync({
        id: targetUser.id,
        isProvider: nextStatus,
        businessName: targetUser.provider?.businessName,
        providerType: targetUser.provider?.providerType ?? 'INDIVIDUAL',
      });
      toast.success(nextStatus ? 'Provider status granted' : 'Provider status revoked');
    } catch {
      toast.error('Failed to update provider status');
    }
  };

  const handleToggleRole = async (targetUser: AdminUserRecord, roleToToggle: Role) => {
    const hasRole = targetUser.roles.includes(roleToToggle);
    const newRoles = hasRole
      ? targetUser.roles.filter((r) => r !== roleToToggle)
      : [...targetUser.roles, roleToToggle];
    try {
      await setRoles.mutateAsync({ id: targetUser.id, roles: newRoles });
      toast.success(`Role updated: ${hasRole ? 'Removed' : 'Added'} ${roleToToggle}`);
    } catch {
      toast.error('Failed to update user roles');
    }
  };

  const handleBan = async (targetUserId: string) => {
    try {
      await banUser.mutateAsync({ id: targetUserId, reason: banReason.trim() || 'Suspended via Customer 360 CRM' });
      toast.success('Account suspended successfully');
      setBanReason('');
      setShowBanInput(false);
    } catch {
      toast.error('Failed to suspend account');
    }
  };

  const handleUnban = async (targetUserId: string) => {
    try {
      await unbanUser.mutateAsync(targetUserId);
      toast.success('Account reinstated successfully');
    } catch {
      toast.error('Failed to reinstate account');
    }
  };

  const handleToggleTrustFlag = async (
    targetUserId: string,
    flag: 'phoneVerified' | 'emailVerified' | 'identityVerified' | 'businessVerified',
    currentValue: boolean,
  ) => {
    try {
      await updateTrust.mutateAsync({
        id: targetUserId,
        flags: { [flag]: !currentValue },
      });
      toast.success(`Updated ${flag} to ${!currentValue ? 'Verified' : 'Unverified'}`);
    } catch {
      toast.error('Failed to update trust verification flag');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Customer 360 CRM
            </h1>
            <Badge variant="trust" className="text-xs">
              Accounts Registry
            </Badge>
          </div>
          <p className="mt-1 text-xs text-ink-soft sm:text-sm">
            Comprehensive customer profile views, integrity audits, connected needs &amp; listings, and role arbitration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 font-mono-num text-xs">
            {data?.meta?.total ?? 0} Accounts Registered
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-xs text-ink-soft hover:text-ink"
          >
            <RefreshCw className="size-3.5" /> Sync
          </Button>
        </div>
      </div>

      {/* Search & Role Filter Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by customer name, email, phone, city..."
            className="pl-9 pr-8 text-xs bg-surface"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Role Quick Filters */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: 'ALL', label: 'All Users' },
            { key: 'PROVIDER', label: 'Providers' },
            { key: 'USER', label: 'Seekers' },
            { key: 'ADMIN', label: 'Admins' },
            { key: 'BANNED', label: 'Suspended' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key as 'ALL' | 'PROVIDER' | 'USER' | 'ADMIN' | 'BANNED')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                roleFilter === tab.key
                  ? 'bg-trust text-white shadow-xs'
                  : 'border border-border bg-surface text-ink-soft hover:bg-canvas-alt'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Registry CRM Table */}
      <AdminResourceTable<AdminUserRecord>
        items={filteredUsers}
        getRowKey={(u) => u.id}
        isLoading={isLoading}
        emptyMessage="No customer records match your filter criteria."
        columns={[
          {
            header: 'Customer Profile',
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
                    onClick={() => handleCopy(u.id, 'User ID')}
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
            header: 'Contact & Hub',
            render: (u) => (
              <div className="space-y-0.5 text-xs">
                <span className="flex items-center gap-1 text-ink-soft">
                  <MapPin className="size-3 text-ink-faint shrink-0" />
                  {u.city ?? '—'}
                </span>
                {u.phone ? (
                  <a
                    href={`tel:${u.phone}`}
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
            header: 'Roles & Classification',
            render: (u) => {
              const isProv = isUserProvider(u);
              const isAdm = u.roles.includes('ADMIN') || u.roles.includes('SUPER_ADMIN');
              return (
                <div className="flex flex-wrap gap-1 max-w-[170px]">
                  {isAdm && (
                    <Badge variant="trust" className="text-[10px] font-bold uppercase tracking-wider">
                      ADMIN
                    </Badge>
                  )}
                  {isProv && (
                    <Badge variant="hope" className="text-[10px] font-bold uppercase tracking-wider">
                      PROVIDER
                    </Badge>
                  )}
                  {!isAdm && !isProv && (
                    <Badge variant="outline" className="text-[10px] text-ink-soft">
                      SEEKER
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
            header: 'Integrity Badges',
            render: (u) => (
              <div className="flex items-center gap-1.5">
                <span
                  title={u.trust?.phoneVerified ? 'Phone Verified' : 'Phone Unverified'}
                  className={`flex size-5 items-center justify-center rounded-full text-[10px] ${
                    u.trust?.phoneVerified ? 'bg-faith-soft text-faith' : 'bg-canvas-alt text-ink-faint'
                  }`}
                >
                  <Phone className="size-2.5" />
                </span>
                <span
                  title={u.trust?.emailVerified ? 'Email Verified' : 'Email Unverified'}
                  className={`flex size-5 items-center justify-center rounded-full text-[10px] ${
                    u.trust?.emailVerified ? 'bg-trust-soft text-trust' : 'bg-canvas-alt text-ink-faint'
                  }`}
                >
                  <Mail className="size-2.5" />
                </span>
                <span
                  title={u.trust?.identityVerified ? 'Identity / KYC Verified' : 'Identity Unverified'}
                  className={`flex size-5 items-center justify-center rounded-full text-[10px] ${
                    u.trust?.identityVerified ? 'bg-faith-soft text-faith' : 'bg-canvas-alt text-ink-faint'
                  }`}
                >
                  <ShieldCheck className="size-2.5" />
                </span>
                <span
                  title={u.trust?.businessVerified ? 'Business Verified' : 'Business Unverified'}
                  className={`flex size-5 items-center justify-center rounded-full text-[10px] ${
                    u.trust?.businessVerified ? 'bg-hope-soft text-hope' : 'bg-canvas-alt text-ink-faint'
                  }`}
                >
                  <Building2 className="size-2.5" />
                </span>
              </div>
            ),
          },
          {
            header: 'Trust Score',
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
            header: 'Status',
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
            header: 'Joined',
            render: (u) => (
              <span className="text-xs text-ink-faint font-mono">
                {formatDate(u.createdAt)}
              </span>
            ),
          },
          {
            header: 'CRM Actions',
            render: (u) => (
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setActiveDossierTab('overview');
                  }}
                  className="h-8 text-xs px-2.5 font-semibold text-trust hover:bg-trust-soft/50"
                >
                  <UserCheck className="size-3 mr-1" /> Inspect 360
                </Button>
                {u.isBanned ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUnban(u.id)}
                    className="h-8 text-xs px-2 text-faith hover:bg-faith/10"
                    title="Reinstate Account"
                  >
                    <Undo2 className="size-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setShowBanInput(true);
                      setActiveDossierTab('security');
                    }}
                    className="h-8 text-xs px-2 text-danger hover:bg-danger/10"
                    title="Suspend Account"
                  >
                    <Ban className="size-3.5" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Pagination Bar */}
      {data && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-ink-faint">
            Displaying page {page} of {Math.ceil((data.meta.total ?? 1) / 20)}
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

      {/* Customer 360 Comprehensive Inspect Dossier Modal */}
      <Dialog open={Boolean(selectedUserId)} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        {currentUserRecord && (
          <DialogContent className="w-[calc(100%-2rem)] max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-14 ring-2 ring-trust/20 shrink-0">
                    <AvatarImage src={currentUserRecord.avatarUrl} alt={currentUserRecord.name} />
                    <AvatarFallback className="bg-trust text-white text-lg font-bold">
                      {initials(currentUserRecord.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="font-display text-lg font-bold text-ink">
                        {currentUserRecord.name}
                      </DialogTitle>
                      {currentUserRecord.isBanned ? (
                        <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-bold text-danger border border-danger/20">
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="rounded-full bg-faith/10 px-2 py-0.5 text-[10px] font-bold text-faith border border-faith/20">
                          ACTIVE ACCOUNT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-ink-faint flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="size-3" /> {currentUserRecord.email || 'No email'}
                      </span>
                      {currentUserRecord.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="size-3" /> {currentUserRecord.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" /> {currentUserRecord.city ?? 'Location unset'}
                      </span>
                      <button
                        onClick={() => handleCopy(currentUserRecord.id, 'User ID')}
                        className="flex items-center gap-1 font-mono hover:text-trust"
                        title="Copy User ID"
                      >
                        <Copy className="size-3" /> {currentUserRecord.id.slice(0, 10)}...
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scalable Quick Operations Toolbar */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="text-xs"
                  >
                    <Link href={`/providers/${currentUserRecord.id}`} target="_blank">
                      <ExternalLink className="size-3 mr-1" /> Public View
                    </Link>
                  </Button>
                  {currentUserRecord.isBanned ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnban(currentUserRecord.id)}
                      className="text-xs text-faith border-faith/30 hover:bg-faith/10 font-semibold"
                    >
                      <Undo2 className="size-3 mr-1" /> Reinstate
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setShowBanInput(!showBanInput);
                        setActiveDossierTab('security');
                      }}
                      className="text-xs font-semibold"
                    >
                      <Ban className="size-3 mr-1" /> Suspend
                    </Button>
                  )}
                </div>
              </div>

              {/* Suspension Reason Alert Banner */}
              {currentUserRecord.isBanned && (
                <div className="mt-3 rounded-lg border border-danger/30 bg-danger-soft/40 p-3 text-xs text-danger flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-4 shrink-0" />
                    <span>
                      <strong>Account Suspended:</strong> {currentUserRecord.bannedReason || 'No reason specified by operator.'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnban(currentUserRecord.id)}
                    className="h-7 text-xs bg-surface"
                  >
                    Lift Ban
                  </Button>
                </div>
              )}
            </DialogHeader>

            {/* Multi-Tab Customer 360 Workspace */}
            <Tabs value={activeDossierTab} onValueChange={setActiveDossierTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-4 sm:inline-flex sm:w-auto">
                <TabsTrigger value="overview" className="text-xs gap-1.5">
                  <UserCheck className="size-3.5" /> 360 Profile &amp; Trust
                </TabsTrigger>
                <TabsTrigger value="needs" className="text-xs gap-1.5">
                  <Package className="size-3.5" /> Needs Posted ({dossier?.stats?.totalNeeds ?? '…'})
                </TabsTrigger>
                <TabsTrigger value="listings" className="text-xs gap-1.5">
                  <Store className="size-3.5" /> Inventory ({dossier?.stats?.totalListings ?? '…'})
                </TabsTrigger>
                <TabsTrigger value="orders" className="text-xs gap-1.5">
                  <ShoppingBag className="size-3.5" /> Deals Pipeline ({
                    (dossier?.stats?.totalBuyerOrders ?? 0) + (dossier?.stats?.totalProviderOrders ?? 0)
                  })
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: 360 Profile & Trust Integrity */}
              <TabsContent value="overview" className="space-y-6 pt-3">
                {/* Trust Scorecard Metrics */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-border bg-surface p-3.5">
                    <p className="text-xs text-ink-faint">Rating CSAT</p>
                    <p className="mt-1 font-display text-xl font-bold text-amber-500 flex items-center gap-1">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      {currentUserRecord.trust?.ratingAverage ? currentUserRecord.trust.ratingAverage.toFixed(1) : '5.0'}
                    </p>
                    <p className="mt-0.5 text-[10px] text-ink-faint">{currentUserRecord.trust?.ratingCount ?? 0} reviews</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-3.5">
                    <p className="text-xs text-ink-faint">Deals Completed</p>
                    <p className="mt-1 font-display text-xl font-bold text-ink">
                      {currentUserRecord.trust?.completedTransactions ?? 0}
                    </p>
                    <p className="mt-0.5 text-[10px] text-ink-faint">Verified orders</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-3.5">
                    <p className="text-xs text-ink-faint">Response Rate</p>
                    <p className="mt-1 font-display text-xl font-bold text-faith">
                      {Math.round((currentUserRecord.trust?.responseRate ?? 1) * 100)}%
                    </p>
                    <p className="mt-0.5 text-[10px] text-ink-faint">Avg reply under 1 hr</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-3.5">
                    <p className="text-xs text-ink-faint">Cancellation Rate</p>
                    <p className="mt-1 font-display text-xl font-bold text-ink">
                      {Math.round((currentUserRecord.trust?.cancellationRate ?? 0) * 100)}%
                    </p>
                    <p className="mt-0.5 text-[10px] text-ink-faint">Platform benchmark &lt; 5%</p>
                  </div>
                </div>

                {/* Verification Badges with Admin Overrides */}
                <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                        Trust Sentinel Verifications
                      </h4>
                      <p className="text-xs text-ink-soft">
                        Toggle identity and compliance flags to audit or verify this customer.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Operator Override
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {[
                      {
                        key: 'phoneVerified' as const,
                        label: 'Phone OTP Verification',
                        icon: Phone,
                        val: Boolean(currentUserRecord.trust?.phoneVerified),
                      },
                      {
                        key: 'emailVerified' as const,
                        label: 'Email Address Verification',
                        icon: Mail,
                        val: Boolean(currentUserRecord.trust?.emailVerified),
                      },
                      {
                        key: 'identityVerified' as const,
                        label: 'Identity / Government KYC',
                        icon: ShieldCheck,
                        val: Boolean(currentUserRecord.trust?.identityVerified),
                      },
                      {
                        key: 'businessVerified' as const,
                        label: 'Business Registration & GST',
                        icon: Building2,
                        val: Boolean(currentUserRecord.trust?.businessVerified),
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-lg border border-border/80 bg-canvas-alt/50 p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="size-4 text-ink-faint" />
                          <span className="font-medium text-ink">{item.label}</span>
                        </div>
                        <Button
                          size="sm"
                          variant={item.val ? 'hope' : 'outline'}
                          onClick={() => handleToggleTrustFlag(currentUserRecord.id, item.key, item.val)}
                          className="h-7 text-xs px-2.5 font-semibold"
                        >
                          {item.val ? (
                            <>
                              <Check className="size-3 mr-1" /> Verified
                            </>
                          ) : (
                            'Verify'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Provider Marketplace Status & Arbitration Card */}
                <div
                  className={`rounded-xl border p-4 space-y-3 transition-colors ${
                    isUserProvider(currentUserRecord)
                      ? 'border-hope/40 bg-hope-soft/20'
                      : 'border-border bg-surface'
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Store
                        className={`size-4 ${
                          isUserProvider(currentUserRecord) ? 'text-hope' : 'text-ink-faint'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                            Provider Marketplace Status
                          </h4>
                          {isUserProvider(currentUserRecord) ? (
                            <Badge variant="hope" className="text-[10px] font-bold">
                              ACTIVE PROVIDER
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-ink-soft">
                              STANDARD SEEKER
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-ink-soft">
                          Arbitrate provider access, catalog listing privileges, and public profile visibility.
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isUserProvider(currentUserRecord) ? 'destructive' : 'hope'}
                      onClick={() =>
                        handleToggleProvider(currentUserRecord, !isUserProvider(currentUserRecord))
                      }
                      disabled={toggleProvider.isPending}
                      className="h-8 text-xs font-bold shrink-0"
                    >
                      {toggleProvider.isPending ? (
                        <>
                          <Loader2 className="size-3 animate-spin mr-1.5" />
                          Updating...
                        </>
                      ) : isUserProvider(currentUserRecord) ? (
                        'Revoke Provider Access'
                      ) : (
                        'Grant Provider Status'
                      )}
                    </Button>
                  </div>

                  {isUserProvider(currentUserRecord) && (
                    <div className="pt-2 border-t border-hope/20 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                      <div>
                        <span className="text-ink-faint">Business Name:</span>{' '}
                        <strong className="text-ink">
                          {currentUserRecord.provider?.businessName || '—'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-faint">Provider Tier:</span>{' '}
                        <Badge variant="hope" className="text-[10px] ml-1">
                          {currentUserRecord.provider?.providerType ?? 'INDIVIDUAL'}
                        </Badge>
                      </div>
                      {currentUserRecord.provider?.serviceCategories?.length ? (
                        <div className="sm:col-span-2">
                          <span className="text-ink-faint">Categories:</span>{' '}
                          <strong className="text-ink">
                            {currentUserRecord.provider.serviceCategories.join(', ')}
                          </strong>
                        </div>
                      ) : null}
                      {currentUserRecord.provider?.description && (
                        <p className="sm:col-span-2 mt-1 text-xs text-ink-soft bg-surface/70 p-2 rounded-lg border border-border/60">
                          {currentUserRecord.provider.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Assigned Roles Management */}
                <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                    Roles &amp; Authority Assignment
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(['USER', 'PROVIDER', 'BUSINESS', 'MODERATOR', 'ADMIN'] as Role[]).map((role) => {
                      const active = currentUserRecord.roles.includes(role);
                      return (
                        <button
                          key={role}
                          onClick={() => handleToggleRole(currentUserRecord, role)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                            active
                              ? 'border-trust bg-trust text-white shadow-xs'
                              : 'border-border bg-surface text-ink-soft hover:bg-canvas-alt'
                          }`}
                        >
                          {active ? <CheckCircle2 className="size-3" /> : <Plus className="size-3" />}
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Account Suspension Panel */}
                <div className="rounded-xl border border-danger/20 bg-danger-soft/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-danger">
                    <ShieldAlert className="size-4" />
                    <span className="text-xs font-bold">Account Suspension Control</span>
                  </div>
                  {currentUserRecord.isBanned ? (
                    <div className="space-y-2">
                      <p className="text-xs text-ink-soft">
                        This account is currently suspended from trading and posting. Reinstating will immediately restore marketplace access.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnban(currentUserRecord.id)}
                        className="text-xs text-faith border-faith/30 hover:bg-faith/10 font-bold"
                      >
                        <Undo2 className="size-3.5 mr-1" /> Reinstate / Unban Account
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Suspension rationale for audit log (e.g., fraudulent listings, policy violation)..."
                        className="text-xs bg-surface"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBan(currentUserRecord.id)}
                        className="text-xs font-semibold"
                      >
                        <Ban className="size-3.5 mr-1" /> Suspend Customer Account
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 2: Related Posts / Needs */}
              <TabsContent value="needs" className="space-y-4 pt-3">
                {dossierLoading ? (
                  <div className="py-12 text-center text-ink-faint">
                    <Loader2 className="size-6 animate-spin mx-auto text-trust" />
                    <p className="mt-2 text-xs">Loading customer&apos;s demand stream...</p>
                  </div>
                ) : !dossier?.needs || dossier.needs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-10 text-center">
                    <Package className="size-8 text-ink-faint mx-auto" />
                    <p className="mt-2 font-display text-sm font-semibold text-ink">No Needs Posted</p>
                    <p className="text-xs text-ink-faint">This customer has not posted any needs yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {dossier.needs.map((need) => (
                      <div
                        key={need.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 hover:border-trust/40 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-display text-xs font-bold text-ink truncate">{need.title}</h5>
                            <Badge variant="outline" className="text-[10px]">
                              {need.status}
                            </Badge>
                          </div>
                          {need.description && (
                            <p className="mt-1 text-xs text-ink-soft line-clamp-1">{need.description}</p>
                          )}
                          <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-faint flex-wrap">
                            <span className="flex items-center gap-1">
                              <Wallet className="size-3" />
                              {need.budget?.max ? `Budget: ₹${need.budget.max.toLocaleString('en-IN')}` : 'Flexible'}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" /> {need.location.label}
                            </span>
                            <span>Posted {formatDate(need.createdAt)}</span>
                          </div>
                        </div>

                        <Button size="sm" variant="outline" asChild className="h-8 text-xs shrink-0">
                          <Link href={`/needs/${need.id}`} target="_blank">
                            <Eye className="size-3 mr-1" /> View Need
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* TAB 3: Provider Listings */}
              <TabsContent value="listings" className="space-y-4 pt-3">
                {dossierLoading ? (
                  <div className="py-12 text-center text-ink-faint">
                    <Loader2 className="size-6 animate-spin mx-auto text-trust" />
                    <p className="mt-2 text-xs">Loading provider inventory catalog...</p>
                  </div>
                ) : !dossier?.listings || dossier.listings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-10 text-center">
                    <Store className="size-8 text-ink-faint mx-auto" />
                    <p className="mt-2 font-display text-sm font-semibold text-ink">No Listings Created</p>
                    <p className="text-xs text-ink-faint">This account has no active or archived listings.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {dossier.listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 hover:border-hope/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {listing.images?.[0] ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="size-12 rounded-lg object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="flex size-12 items-center justify-center rounded-lg bg-canvas-alt text-ink-faint shrink-0">
                              <Store className="size-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-display text-xs font-bold text-ink truncate">{listing.title}</h5>
                              <Badge variant="outline" className="text-[10px]">
                                {listing.status}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-ink-faint">
                              <span className="font-bold text-hope">
                                {formatPrice(listing.price.amount, listing.price.currency)}
                                {listing.price.unit ? ` / ${listing.price.unit}` : ''}
                              </span>
                              <span>{listing.modes.join(', ')}</span>
                              <span>{listing.viewCount ?? 0} views</span>
                            </div>
                          </div>
                        </div>

                        <Button size="sm" variant="outline" asChild className="h-8 text-xs shrink-0">
                          <Link href={`/listings/${listing.id}`} target="_blank">
                            <Eye className="size-3 mr-1" /> View Listing
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* TAB 4: Orders & Deals Pipeline */}
              <TabsContent value="orders" className="space-y-4 pt-3">
                {dossierLoading ? (
                  <div className="py-12 text-center text-ink-faint">
                    <Loader2 className="size-6 animate-spin mx-auto text-trust" />
                    <p className="mt-2 text-xs">Loading transaction escrow records...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Buyer Orders */}
                    <div>
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink mb-2">
                        Seeker Purchases ({dossier?.buyerOrders?.length ?? 0})
                      </h4>
                      {!dossier?.buyerOrders || dossier.buyerOrders.length === 0 ? (
                        <p className="text-xs text-ink-faint italic">No purchase transactions found.</p>
                      ) : (
                        <div className="space-y-2">
                          {dossier.buyerOrders.map((o) => (
                            <div
                              key={o.id}
                              className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 text-xs"
                            >
                              <div>
                                <span className="font-mono text-ink-faint">#{o.id.slice(0, 8)}</span>
                                <p className="font-bold text-ink mt-0.5">{formatPrice(o.amount, o.currency)}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-[10px]">
                                  {ORDER_STATUS_LABELS[o.status] ?? o.status}
                                </Badge>
                                <span className="text-ink-faint font-mono">{formatDate(o.createdAt)}</span>
                                <Button size="sm" variant="ghost" asChild className="h-7 text-xs">
                                  <Link href={`/admin/orders`}>Inspect</Link>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Provider Orders */}
                    <div>
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-hope mb-2">
                        Provider Sales ({dossier?.providerOrders?.length ?? 0})
                      </h4>
                      {!dossier?.providerOrders || dossier.providerOrders.length === 0 ? (
                        <p className="text-xs text-ink-faint italic">No provider sale transactions found.</p>
                      ) : (
                        <div className="space-y-2">
                          {dossier.providerOrders.map((o) => (
                            <div
                              key={o.id}
                              className="flex items-center justify-between rounded-lg border border-hope/30 bg-hope-soft/10 p-3 text-xs"
                            >
                              <div>
                                <span className="font-mono text-ink-faint">#{o.id.slice(0, 8)}</span>
                                <p className="font-bold text-ink mt-0.5">{formatPrice(o.amount, o.currency)}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="hope" className="text-[10px]">
                                  {ORDER_STATUS_LABELS[o.status] ?? o.status}
                                </Badge>
                                <span className="text-ink-faint font-mono">{formatDate(o.createdAt)}</span>
                                <Button size="sm" variant="ghost" asChild className="h-7 text-xs">
                                  <Link href={`/admin/orders`}>Inspect</Link>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 border-t border-border pt-3">
              <Button variant="outline" onClick={() => setSelectedUserId(null)} className="w-full sm:w-auto">
                Close Customer 360 Dossier
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
