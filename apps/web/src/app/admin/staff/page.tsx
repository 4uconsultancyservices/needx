'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';
import {
  useAssignStaff,
  useCreateStaffUser,
  useMyStaffProfile,
  useRevokeStaff,
  useStaffList,
  useStaffPermissionsCatalog,
  useUpdateStaff,
} from '@/hooks/use-staff';
import { useAdminUsers } from '@/hooks/use-admin';
import { useDebounce } from '@/hooks/use-debounce';
import { AdminResourceTable } from '@/components/admin/admin-resource-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/shared/pagination';
import { formatDate, initials } from '@/lib/utils';
import {
  STAFF_DEPARTMENTS,
  STAFF_MODULES,
  type Role,
  type StaffDepartment,
  type StaffModule,
  type StaffUserRecord,
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

const MODULE_CUSTOM_ACTIONS: Partial<Record<StaffModule, string[]>> = {
  users: ['ban'],
  orders: ['refund'],
  payments: ['refund'],
  disputes: ['resolve'],
  notifications: ['broadcast'],
  moderation: ['export'],
};

type StaffRole = 'STAFF' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

interface QuickRolePreset {
  id: string;
  label: string;
  department: StaffDepartment;
  baseRole: StaffRole;
  designation: string;
  queues: string[];
  permissions: string[];
  description: string;
}

const QUICK_ROLE_PRESETS: QuickRolePreset[] = [
  {
    id: 'SUPPORT_SPECIALIST',
    label: 'Customer Support',
    department: 'CUSTOMER_SUPPORT',
    baseRole: 'STAFF',
    designation: 'Customer Support Specialist',
    queues: ['tier1-support', 'general-inquiries'],
    permissions: [
      'users:read',
      'needs:read',
      'orders:read',
      'disputes:read',
      'disputes:resolve',
      'reviews:read',
      'reviews:update',
    ],
    description: 'Handles tickets, buyer inquiries, dispute arbitration, and review moderation.',
  },
  {
    id: 'TRUST_SAFETY_MODERATOR',
    label: 'Trust & Safety',
    department: 'TRUST_AND_SAFETY',
    baseRole: 'STAFF',
    designation: 'Trust & Safety Arbitrator',
    queues: ['fraud-alerts', 'high-priority-disputes'],
    permissions: [
      'reports:*',
      'disputes:*',
      'moderation:*',
      'users:ban',
      'users:read',
      'reviews:*',
    ],
    description: 'Investigates user reports, fraud flags, and enforces platform bans.',
  },
  {
    id: 'FINANCE_CONTROLLER',
    label: 'Finance & Billing',
    department: 'FINANCE',
    baseRole: 'STAFF',
    designation: 'Treasury & Escrow Controller',
    queues: ['escrow-disbursement', 'refund-audit'],
    permissions: [
      'payments:*',
      'orders:read',
      'orders:refund',
    ],
    description: 'Manages ledger releases, escrow holding balances, and order refunds.',
  },
  {
    id: 'CATALOG_MANAGER',
    label: 'Catalog & Taxonomy',
    department: 'CATALOG_TAXONOMY',
    baseRole: 'STAFF',
    designation: 'Catalog Quality & Taxonomy Lead',
    queues: ['taxonomy-review'],
    permissions: [
      'categories:*',
      'listings:*',
    ],
    description: 'Curates product categories, attributes, and verifies provider listings.',
  },
  {
    id: 'OPERATIONS_LEAD',
    label: 'Operations Lead',
    department: 'OPERATIONS',
    baseRole: 'ADMIN',
    designation: 'Marketplace Operations Lead',
    queues: ['marketplace-ops'],
    permissions: [
      'dashboard:*',
      'needs:*',
      'listings:*',
      'orders:*',
      'categories:*',
    ],
    description: 'Oversees daily live needs, matching supply-demand, and orders.',
  },
  {
    id: 'SUPER_ADMIN_PRESET',
    label: 'Master Wildcard (*)',
    department: 'EXECUTIVE',
    baseRole: 'SUPER_ADMIN',
    designation: 'Platform Administrator',
    queues: ['executive-escalations', 'master-admin'],
    permissions: ['*'],
    description: 'Complete unrestricted access across all system modules.',
  },
];

export default function AdminStaffPage() {
  const [q, setQ] = useState('');
  const [selectedDept, setSelectedDept] = useState<StaffDepartment | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [page, setPage] = useState(1);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE_NEW' | 'ASSIGN_EXISTING'>('CREATE_NEW');
  const [editingStaff, setEditingStaff] = useState<StaffUserRecord | null>(null);
  const [revokingStaff, setRevokingStaff] = useState<StaffUserRecord | null>(null);

  // New Staff Fields
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('Needx@12345');
  const [showPassword, setShowPassword] = useState(false);
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffCity, setNewStaffCity] = useState('Delhi');

  // Assign Existing Fields
  const [targetUserId, setTargetUserId] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Common Staff Settings
  const [selectedDepartment, setSelectedDepartment] = useState<StaffDepartment>('CUSTOMER_SUPPORT');
  const [designation, setDesignation] = useState('Customer Support Specialist');
  const [baseRole, setBaseRole] = useState<StaffRole>('STAFF');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [assignedQueues, setAssignedQueues] = useState('tier1-support, general-inquiries');
  const [activePresetId, setActivePresetId] = useState<string>('SUPPORT_SPECIALIST');

  const debouncedQ = useDebounce(q);
  const debouncedUserSearch = useDebounce(userSearchQuery);

  const { data: staffData, isLoading, refetch, isFetching } = useStaffList({
    page,
    limit: 20,
    q: debouncedQ || undefined,
    department: selectedDept === 'ALL' ? undefined : selectedDept,
  });

  const { data: myStaffProfile } = useMyStaffProfile();
  const { data: catalog } = useStaffPermissionsCatalog();
  const { data: candidateUsers } = useAdminUsers({
    page: 1,
    limit: 10,
    q: debouncedUserSearch || undefined,
  });

  const assignStaffMutation = useAssignStaff();
  const createStaffUserMutation = useCreateStaffUser();
  const updateStaffMutation = useUpdateStaff();
  const revokeStaffMutation = useRevokeStaff();

  const isSuperAdmin = Boolean(myStaffProfile?.isSuperAdmin);

  // Filter staff by status on client
  const staffMembers = useMemo(() => {
    return (staffData?.data ?? []).filter((s) => {
      const isSuspended = Boolean(s.staffProfile?.isSuspended ?? (s as unknown as { isSuspended?: boolean }).isSuspended);
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'ACTIVE') return !isSuspended;
      if (statusFilter === 'SUSPENDED') return isSuspended;
      return true;
    });
  }, [staffData?.data, statusFilter]);

  // Aggregate KPI stats
  const totalStaff = staffData?.meta?.total ?? staffData?.data?.length ?? 0;
  const activeStaff = (staffData?.data ?? []).filter(
    (s) => !Boolean(s.staffProfile?.isSuspended ?? (s as unknown as { isSuspended?: boolean }).isSuspended),
  ).length;
  const suspendedStaff = (staffData?.data ?? []).filter(
    (s) => Boolean(s.staffProfile?.isSuspended ?? (s as unknown as { isSuspended?: boolean }).isSuspended),
  ).length;

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pwd = 'Needx@';
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewStaffPassword(pwd);
    toast.success('Generated secure staff password');
  };

  const resetForm = () => {
    setModalMode('CREATE_NEW');
    setTargetUserId('');
    setUserSearchQuery('');
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPassword('Needx@12345');
    setShowPassword(false);
    setNewStaffPhone('');
    setNewStaffCity('Delhi');
    setSelectedDepartment('CUSTOMER_SUPPORT');
    setDesignation('Customer Support Specialist');
    setBaseRole('STAFF');
    setSelectedPermissions([]);
    setAssignedQueues('tier1-support, general-inquiries');
    setActivePresetId('SUPPORT_SPECIALIST');
    setEditingStaff(null);
  };

  const handleOpenCreateNew = () => {
    resetForm();
    setModalMode('CREATE_NEW');
    applyRolePreset('SUPPORT_SPECIALIST');
    setIsAssignModalOpen(true);
  };

  const handleOpenAssignExisting = () => {
    resetForm();
    setModalMode('ASSIGN_EXISTING');
    applyRolePreset('SUPPORT_SPECIALIST');
    setIsAssignModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffUserRecord) => {
    setEditingStaff(staff);
    const userId = staff.id || (staff as unknown as { userId?: string }).userId || '';
    setTargetUserId(userId);
    const profile = staff.staffProfile || (staff as unknown as {
      department: StaffDepartment;
      designation: string;
      role: StaffRole;
      permissions: string[];
      assignedQueues: string[];
    });
    setSelectedDepartment(profile.department || 'CUSTOMER_SUPPORT');
    setDesignation(profile.designation || '');
    const r = profile.role;
    setBaseRole(
      r === 'STAFF' || r === 'MODERATOR' || r === 'ADMIN' || r === 'SUPER_ADMIN' ? r : 'STAFF',
    );
    setSelectedPermissions(profile.permissions || []);
    setAssignedQueues(profile.assignedQueues?.join(', ') || '');
    setActivePresetId('');
    setIsAssignModalOpen(true);
  };

  const applyRolePreset = (presetId: string) => {
    const preset = QUICK_ROLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPermissions([...preset.permissions]);
    setSelectedDepartment(preset.department);
    setBaseRole(preset.baseRole);
    if (!editingStaff) {
      setDesignation(preset.designation);
      setAssignedQueues(preset.queues.join(', '));
    }
    setActivePresetId(preset.id);
    toast.info(`Applied "${preset.label}" role template (${preset.permissions.length} module permissions)`);
  };

  const togglePermission = (perm: string) => {
    setActivePresetId('');
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const toggleFullModule = (moduleKey: StaffModule) => {
    setActivePresetId('');
    const fullPerm = `${moduleKey}:*`;
    setSelectedPermissions((prev) => {
      if (prev.includes(fullPerm)) {
        return prev.filter((p) => !p.startsWith(`${moduleKey}:`));
      } else {
        const filtered = prev.filter((p) => !p.startsWith(`${moduleKey}:`));
        return [...filtered, fullPerm];
      }
    });
  };

  const handleSaveStaff = async () => {
    if (editingStaff) {
      if (!designation.trim()) {
        toast.error('Please specify a staff designation/title');
        return;
      }
      const queues = assignedQueues
        .split(',')
        .map((q) => q.trim())
        .filter(Boolean);

      try {
        await updateStaffMutation.mutateAsync({
          userId: editingStaff.id,
          input: {
            department: selectedDepartment,
            designation: designation.trim(),
            role: baseRole,
            permissions: selectedPermissions,
            assignedQueues: queues,
          },
        });
        toast.success(`Staff profile for ${editingStaff.name} updated successfully`);
        setIsAssignModalOpen(false);
        resetForm();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update staff record';
        toast.error(message);
      }
      return;
    }

    if (modalMode === 'CREATE_NEW') {
      if (!newStaffName.trim()) {
        toast.error('Please enter the staff member full name');
        return;
      }
      if (!newStaffEmail.trim() || !newStaffEmail.includes('@')) {
        toast.error('Please enter a valid work email address');
        return;
      }
      if (!newStaffPassword || newStaffPassword.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      if (!designation.trim()) {
        toast.error('Please enter a designation/role title');
        return;
      }

      const queues = assignedQueues
        .split(',')
        .map((q) => q.trim())
        .filter(Boolean);

      try {
        await createStaffUserMutation.mutateAsync({
          name: newStaffName.trim(),
          email: newStaffEmail.trim().toLowerCase(),
          password: newStaffPassword,
          phone: newStaffPhone.trim() || undefined,
          city: newStaffCity.trim() || undefined,
          department: selectedDepartment,
          designation: designation.trim(),
          role: baseRole,
          permissions: selectedPermissions,
          assignedQueues: queues,
        });
        toast.success(`Staff account for ${newStaffName} created and onboarded successfully!`);
        setIsAssignModalOpen(false);
        resetForm();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create staff account';
        toast.error(message);
      }
      return;
    }

    if (modalMode === 'ASSIGN_EXISTING') {
      if (!targetUserId) {
        toast.error('Please search and select a platform user to assign');
        return;
      }
      if (!designation.trim()) {
        toast.error('Please enter a designation/role title');
        return;
      }

      const queues = assignedQueues
        .split(',')
        .map((q) => q.trim())
        .filter(Boolean);

      try {
        await assignStaffMutation.mutateAsync({
          userId: targetUserId,
          department: selectedDepartment,
          designation: designation.trim(),
          role: baseRole,
          permissions: selectedPermissions,
          assignedQueues: queues,
        });
        toast.success('Staff member assigned and credentials configured');
        setIsAssignModalOpen(false);
        resetForm();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to assign staff record';
        toast.error(message);
      }
    }
  };

  const handleToggleSuspend = async (staff: StaffUserRecord) => {
    const isCurrentlySuspended = Boolean(
      staff.staffProfile?.isSuspended ?? (staff as unknown as { isSuspended?: boolean }).isSuspended,
    );
    const nextSuspended = !isCurrentlySuspended;
    const userId = staff.id || (staff as unknown as { userId?: string }).userId || '';
    try {
      await updateStaffMutation.mutateAsync({
        userId,
        input: {
          isSuspended: nextSuspended,
        },
      });
      toast.success(
        nextSuspended
          ? `${staff.name} has been suspended from staff operations`
          : `${staff.name}'s staff privileges are restored`,
      );
    } catch {
      toast.error('Failed to change suspension status');
    }
  };

  const handleRevokeStaff = async () => {
    if (!revokingStaff) return;
    try {
      await revokeStaffMutation.mutateAsync(revokingStaff.id);
      toast.success(`Revoked staff role for ${revokingStaff.name}`);
      setRevokingStaff(null);
    } catch {
      toast.error('Failed to revoke staff credentials');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
              Staff & Role-Based Access Control
            </h1>
            <Badge variant="trust" className="text-xs">
              Enterprise RBAC
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Manage platform personnel, departmental designations, assigned queues, and module-level CRUD permissions.
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAssignExisting}
            className="text-xs border-border text-ink hover:bg-canvas-alt"
          >
            <Users className="mr-1.5 size-3.5 text-ink-soft" />
            Link Existing User
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreateNew}
            className="bg-trust text-white hover:bg-trust-hover shadow-xs text-xs font-semibold"
          >
            <UserPlus className="mr-1.5 size-4" />
            + Create Staff Member
          </Button>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Total Staff Force
            </span>
            <Users className="size-4 text-trust" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{totalStaff}</p>
          <p className="mt-1 text-xs text-ink-soft">Across 6 operational divisions</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Active Operators
            </span>
            <ShieldCheck className="size-4 text-faith" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-faith">{activeStaff}</p>
          <p className="mt-1 text-xs text-ink-soft">Authorized for live ticket queues</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Suspended Accounts
            </span>
            <ShieldAlert className="size-4 text-danger" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-danger">{suspendedStaff}</p>
          <p className="mt-1 text-xs text-ink-soft">Temporary access hold active</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Your Permission Tier
            </span>
            <KeyRound className="size-4 text-dawn" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="trust" className="text-xs font-mono">
              {isSuperAdmin ? 'SUPER_ADMIN (*)' : myStaffProfile?.role || 'STAFF'}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            {isSuperAdmin
              ? 'Master Wildcard Bypass'
              : `${myStaffProfile?.permissions.length || 0} active module grants`}
          </p>
        </div>
      </div>

      {/* Staff Roster Table with Dynamic Filters, Pagination, Selection, and Theme Alignment */}
      <AdminResourceTable<StaffUserRecord>
        title="Staff Force & RBAC Roster"
        description="Search, filter, inspect, and configure fine-grained permissions for all platform operators."
        icon={ShieldCheck}
        items={staffMembers}
        getRowKey={(s) => s.id}
        isLoading={isLoading}
        emptyMessage="No staff records match your criteria."
        searchValue={q}
        onSearchChange={(nextQ) => {
          setQ(nextQ);
          setPage(1);
        }}
        searchPlaceholder="Search staff by name, email, designation, or department..."
        serverSideSearch={true}
        quickTabs={[
          { id: 'ALL', label: 'All Departments', count: totalStaff },
          ...STAFF_DEPARTMENTS.map((dept) => {
            const count = (staffData?.data ?? []).filter((s) => {
              const profileDept = s.staffProfile?.department ?? (s as unknown as { department?: string }).department;
              return profileDept === dept;
            }).length;
            return {
              id: dept,
              label: DEPARTMENT_LABELS[dept],
              count,
            };
          }),
        ]}
        activeTab={selectedDept}
        onTabChange={(tabId) => {
          setSelectedDept(tabId as typeof selectedDept);
          setPage(1);
        }}
        facetFilters={[
          {
            id: 'status',
            title: 'Account Status',
            options: [
              { label: 'Active Operators', value: 'ACTIVE', count: activeStaff },
              { label: 'Suspended', value: 'SUSPENDED', count: suspendedStaff },
            ],
          },
        ]}
        activeFilters={{
          status: statusFilter === 'ALL' ? [] : [statusFilter],
        }}
        onFilterChange={(filterId, values) => {
          if (filterId === 'status') {
            if (values.length === 0 || values.length === 2) {
              setStatusFilter('ALL');
            } else {
              setStatusFilter(values[0] as 'ACTIVE' | 'SUSPENDED');
            }
          }
        }}
        page={page}
        pageSize={staffData?.meta?.limit ?? 20}
        totalItems={staffData?.meta?.total ?? 0}
        onPageChange={setPage}
        serverSidePagination={true}
        selectable={true}
        exportable={true}
        exportFilename="needx_staff_roster"
        batchActions={[
          {
            id: 'export-csv',
            label: 'Export CSV',
            icon: ExternalLink,
            onClick: (selected) => {
              const rows = [
                ['ID', 'Name', 'Email', 'Department', 'Designation', 'Role', 'Suspended'].join(','),
                ...selected.map((s) => [
                  s.id,
                  `"${(s.name || '').replace(/"/g, '""')}"`,
                  s.email ?? '',
                  s.staffProfile?.department ?? '',
                  `"${(s.staffProfile?.designation || '').replace(/"/g, '""')}"`,
                  s.staffProfile?.role ?? 'STAFF',
                  s.staffProfile?.isSuspended ? 'YES' : 'NO',
                ].join(',')),
              ].join('\n');
              const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `selected_staff_${Date.now()}.csv`;
              link.click();
              URL.revokeObjectURL(url);
              toast.success(`Exported ${selected.length} staff records to CSV`);
            },
          },
          {
            id: 'copy-emails',
            label: 'Copy Staff Emails',
            icon: Copy,
            onClick: (selected) => {
              const emails = selected.map((s) => s.email).filter(Boolean).join('\n');
              navigator.clipboard.writeText(emails);
              toast.success(`Copied ${selected.length} staff emails`);
            },
          },
        ]}
        columns={[
          {
            id: 'operator',
            header: 'Operator',
            sortable: true,
            accessorFn: (s) => s.name,
            render: (staff) => (
              <div className="flex items-center gap-3">
                <Avatar className="size-8 ring-1 ring-border shrink-0">
                  <AvatarImage src={staff.avatarUrl} alt={staff.name} />
                  <AvatarFallback className="bg-trust text-white text-xs font-semibold">
                    {initials(staff.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-ink truncate">{staff.name}</span>
                    {staff.roles.includes('SUPER_ADMIN') && (
                      <span className="rounded bg-[#0f294a] px-1 py-0.2 text-[9px] font-bold text-dawn uppercase">
                        Super Admin
                      </span>
                    )}
                  </div>
                  <p className="text-ink-faint truncate text-[11px]">{staff.email}</p>
                </div>
              </div>
            ),
          },
          {
            id: 'department',
            header: 'Department & Designation',
            sortable: true,
            accessorFn: (s) => s.staffProfile?.designation || '',
            render: (staff) => {
              const profile = staff.staffProfile || {
                department: (staff as unknown as { department: StaffDepartment }).department || 'CUSTOMER_SUPPORT',
                designation: (staff as unknown as { designation: string }).designation || 'Staff Operator',
              };
              return (
                <div>
                  <p className="font-medium text-ink">{profile.designation}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-trust">
                    {DEPARTMENT_LABELS[profile.department] || profile.department}
                  </span>
                </div>
              );
            },
          },
          {
            id: 'role',
            header: 'Role',
            sortable: true,
            accessorFn: (s) => s.staffProfile?.role || 'STAFF',
            render: (staff) => {
              const role = staff.staffProfile?.role || 'STAFF';
              return (
                <Badge
                  variant={role === 'ADMIN' ? 'trust' : 'outline'}
                  className="text-[10px] font-mono"
                >
                  {role}
                </Badge>
              );
            },
          },
          {
            id: 'permissions',
            header: 'Permissions & Queues',
            render: (staff) => {
              const profile = staff.staffProfile || {
                permissions: [],
                assignedQueues: [],
              };
              const isWildcard = (profile.permissions || []).includes('*');
              return (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    {isWildcard ? (
                      <span className="rounded bg-faith/15 px-1.5 py-0.5 text-[10px] font-bold text-faith">
                        All Modules (*)
                      </span>
                    ) : (
                      <span className="rounded bg-canvas-alt px-1.5 py-0.5 text-[10px] font-medium text-ink-soft border border-border">
                        {profile.permissions?.length || 0} module grant(s)
                      </span>
                    )}
                  </div>
                  {profile.assignedQueues && profile.assignedQueues.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.assignedQueues.map((queue) => (
                        <span
                          key={queue}
                          className="rounded bg-trust/10 px-1.5 py-0.2 text-[9px] font-mono text-trust"
                        >
                          {queue}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            id: 'status',
            header: 'Status',
            sortable: true,
            accessorFn: (s) => (s.staffProfile?.isSuspended ? 'Suspended' : 'Active'),
            render: (staff) => {
              const isSuspended = Boolean(staff.staffProfile?.isSuspended);
              return isSuspended ? (
                <Badge variant="danger" className="text-[10px]">
                  Suspended
                </Badge>
              ) : (
                <Badge variant="faith" className="text-[10px]">
                  Active
                </Badge>
              );
            },
          },
          {
            id: 'lastActive',
            header: 'Last Active',
            sortable: true,
            accessorFn: (s) => s.staffProfile?.lastActiveAt || '',
            render: (staff) => (
              <span className="text-ink-faint text-[11px]">
                {staff.staffProfile?.lastActiveAt ? formatDate(staff.staffProfile.lastActiveAt) : 'Never'}
              </span>
            ),
          },
          {
            id: 'actions',
            header: 'Actions',
            align: 'right',
            render: (staff) => {
              const isSuspended = Boolean(staff.staffProfile?.isSuspended);
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Sliders className="size-3.5 text-ink-soft" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 text-xs">
                    <DropdownMenuItem
                      onClick={() => handleOpenEdit(staff)}
                      className="cursor-pointer"
                    >
                      <Edit3 className="mr-2 size-3.5 text-trust" />
                      <span>Configure Permissions</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleSuspend(staff)}
                      className="cursor-pointer"
                    >
                      {isSuspended ? (
                        <>
                          <UserCheck className="mr-2 size-3.5 text-faith" />
                          <span>Activate Operator</span>
                        </>
                      ) : (
                        <>
                          <UserX className="mr-2 size-3.5 text-danger" />
                          <span>Suspend Operator</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setRevokingStaff(staff)}
                      className="text-danger focus:bg-danger-soft focus:text-danger cursor-pointer"
                    >
                      <Trash2 className="mr-2 size-3.5 text-danger" />
                      <span>Revoke Staff Status</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]}
      />

      {/* Create / Assign Staff Member Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-trust" />
              <span>
                {editingStaff
                  ? `Configure Staff: ${editingStaff.name}`
                  : modalMode === 'CREATE_NEW'
                    ? 'Create & Onboard Staff Member'
                    : 'Assign Staff Role to User'}
              </span>
            </DialogTitle>
            <DialogDescription>
              {editingStaff
                ? 'Modify departmental designation, ticket queues, or granular CRUD permissions.'
                : modalMode === 'CREATE_NEW'
                  ? 'Onboard a new employee with login credentials, department division, and granular module permissions.'
                  : 'Select an existing registered platform user and promote them with staff operating permissions.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Mode Switcher Tabs (Only visible when creating a new staff, not editing) */}
            {!editingStaff && (
              <div className="grid grid-cols-2 rounded-lg bg-canvas-alt p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setModalMode('CREATE_NEW')}
                  className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
                    modalMode === 'CREATE_NEW'
                      ? 'bg-surface text-ink shadow-xs border border-border'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <UserPlus className="size-3.5 text-trust" />
                  <span>Create New Staff Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('ASSIGN_EXISTING')}
                  className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
                    modalMode === 'ASSIGN_EXISTING'
                      ? 'bg-surface text-ink shadow-xs border border-border'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <Users className="size-3.5 text-ink-soft" />
                  <span>Link Existing Platform User</span>
                </button>
              </div>
            )}

            {/* Mode 1: Create New Staff Form */}
            {!editingStaff && modalMode === 'CREATE_NEW' && (
              <div className="space-y-3 rounded-lg border border-border bg-canvas p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <Input
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="e.g. Pooja Hegde"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink">
                      Work Email <span className="text-danger">*</span>
                    </label>
                    <Input
                      type="email"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      placeholder="e.g. pooja@needx.local"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-ink">
                        Password <span className="text-danger">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-[10px] text-trust hover:underline flex items-center gap-0.5"
                      >
                        <Sparkles className="size-2.5" />
                        <span>Generate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={newStaffPassword}
                        onChange={(e) => setNewStaffPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="pr-8 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                      >
                        {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink">Phone (Optional)</label>
                    <Input
                      value={newStaffPhone}
                      onChange={(e) => setNewStaffPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink">City / Location</label>
                    <Input
                      value={newStaffCity}
                      onChange={(e) => setNewStaffCity(e.target.value)}
                      placeholder="Delhi, Mumbai, Bangalore"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Link Existing Platform User */}
            {!editingStaff && modalMode === 'ASSIGN_EXISTING' && (
              <div className="space-y-2 rounded-lg border border-border bg-canvas p-3">
                <label className="text-xs font-semibold text-ink">Search Registered Platform User</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                  <Input
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search candidate by name or email..."
                    className="pl-9 text-xs"
                  />
                </div>
                {candidateUsers?.data && candidateUsers.data.length > 0 && (
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-border bg-canvas-alt p-1.5 space-y-1">
                    {candidateUsers.data.map((u) => {
                      const isSelected = targetUserId === u.id;
                      return (
                        <button
                          type="button"
                          key={u.id}
                          onClick={() => {
                            setTargetUserId(u.id);
                            setUserSearchQuery(u.name || u.email || '');
                          }}
                          className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                            isSelected
                              ? 'bg-trust text-white font-medium'
                              : 'text-ink hover:bg-canvas'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-semibold">{u.name}</span>
                            <span className="ml-2 opacity-75 text-[11px]">{u.email}</span>
                          </div>
                          {isSelected && <Check className="size-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
                <p className="text-[11px] text-ink-faint">
                  Selected User ID: <span className="font-mono">{targetUserId || 'None selected'}</span>
                </p>
              </div>
            )}

            {/* Editing Existing Staff Info Banner */}
            {editingStaff && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-canvas-alt p-3">
                <Avatar className="size-9 ring-1 ring-border">
                  <AvatarImage src={editingStaff.avatarUrl} alt={editingStaff.name} />
                  <AvatarFallback className="bg-trust text-white text-xs font-semibold">
                    {initials(editingStaff.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-ink">{editingStaff.name}</p>
                  <p className="text-[11px] text-ink-faint">{editingStaff.email}</p>
                </div>
              </div>
            )}

            {/* Quick Presets */}
            <div className="space-y-2 rounded-lg border border-border/80 bg-canvas-alt/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  Quick Role Presets
                </span>
                <span className="text-[11px] text-ink-soft">
                  Click to auto-configure department, role, title, and permissions
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ROLE_PRESETS.map((preset) => {
                  const isActive = activePresetId === preset.id;
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => applyRolePreset(preset.id)}
                      className={`text-[11px] h-7 transition-all ${
                        isActive
                          ? 'bg-trust text-white shadow-xs font-semibold border-trust'
                          : 'hover:border-trust hover:text-trust bg-surface text-ink'
                      }`}
                    >
                      {preset.id === 'SUPER_ADMIN_PRESET' && (
                        <Shield className="mr-1 size-3 text-dawn" />
                      )}
                      {preset.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Department & Designation */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Department Division</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setActivePresetId('');
                    setSelectedDepartment(e.target.value as StaffDepartment);
                  }}
                  className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trust"
                >
                  {STAFF_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {DEPARTMENT_LABELS[dept]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Designation / Role Title</label>
                <Input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Lead Dispute Arbitrator, Support Specialist"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Base Role & Queues */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Base Role</label>
                <select
                  value={baseRole}
                  onChange={(e) => {
                    setActivePresetId('');
                    setBaseRole(e.target.value as StaffRole);
                  }}
                  className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trust"
                >
                  <option value="STAFF">STAFF (Scoped to Granted Modules)</option>
                  <option value="ADMIN">ADMIN (Elevated Marketplace Officer)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Master Access)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">
                  Assigned Queues (comma separated)
                </label>
                <Input
                  value={assignedQueues}
                  onChange={(e) => setAssignedQueues(e.target.value)}
                  placeholder="e.g. tier1-support, high-priority-disputes, escrow-audit"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Granular Module Permissions Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink">
                      Granular Module CRUD Matrix
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedPermissions.includes('*') ? 'All Modules (*)' : `${selectedPermissions.length} selected`}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-ink-faint">
                    Selected permissions determine which sidebar items appear and which API operations are allowed.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActivePresetId('SUPER_ADMIN_PRESET');
                      setSelectedPermissions(['*']);
                    }}
                    className="text-[11px] h-6 px-2 text-trust"
                  >
                    Select All (*)
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActivePresetId('');
                      setSelectedPermissions([]);
                    }}
                    className="text-[11px] h-6 px-2 text-danger"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="divide-y divide-border rounded-lg border border-border bg-canvas overflow-hidden">
                {STAFF_MODULES.map((mod) => {
                  const isWildcard = selectedPermissions.includes('*');
                  const isModWildcard = selectedPermissions.includes(`${mod}:*`);
                  const customActions = MODULE_CUSTOM_ACTIONS[mod] ?? [];

                  return (
                    <div key={mod} className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-ink">{MODULE_LABELS[mod]}</span>
                          <span className="text-[10px] text-ink-faint font-mono">({mod})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleFullModule(mod)}
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                            isModWildcard || isWildcard
                              ? 'bg-faith text-white'
                              : 'bg-canvas-alt text-ink-soft hover:bg-trust-soft/60 hover:text-trust'
                          }`}
                        >
                          {isModWildcard || isWildcard ? 'Full Module (*)' : '+ Grant Full Module'}
                        </button>
                      </div>

                      {/* CRUD Checkboxes */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                        {(['read', 'create', 'update', 'delete'] as const).map((action) => {
                          const permKey = `${mod}:${action}`;
                          const isChecked =
                            isWildcard || isModWildcard || selectedPermissions.includes(permKey);
                          return (
                            <label
                              key={permKey}
                              className={`flex items-center gap-1.5 cursor-pointer rounded px-2 py-1 transition-colors ${
                                isChecked
                                  ? 'bg-trust-soft/50 font-medium text-trust'
                                  : 'text-ink-soft hover:bg-canvas-alt'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isWildcard || isModWildcard}
                                onChange={() => togglePermission(permKey)}
                                className="rounded border-border text-trust focus:ring-trust"
                              />
                              <span className="capitalize">{action}</span>
                            </label>
                          );
                        })}

                        {/* Custom specialized module actions */}
                        {customActions.map((specialAction) => {
                          const permKey = `${mod}:${specialAction}`;
                          const isChecked =
                            isWildcard || isModWildcard || selectedPermissions.includes(permKey);
                          return (
                            <label
                              key={permKey}
                              className={`flex items-center gap-1.5 cursor-pointer rounded px-2 py-1 transition-colors ${
                                isChecked
                                  ? 'bg-dawn/15 font-medium text-dawn'
                                  : 'text-ink-soft hover:bg-canvas-alt'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isWildcard || isModWildcard}
                                onChange={() => togglePermission(permKey)}
                                className="rounded border-border text-dawn focus:ring-dawn"
                              />
                              <span className="capitalize">{specialAction}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveStaff}
              disabled={
                assignStaffMutation.isPending ||
                updateStaffMutation.isPending ||
                createStaffUserMutation.isPending
              }
              className="bg-trust text-white hover:bg-trust-hover font-semibold"
            >
              {(assignStaffMutation.isPending ||
                updateStaffMutation.isPending ||
                createStaffUserMutation.isPending) && (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              )}
              {editingStaff
                ? 'Save Changes'
                : modalMode === 'CREATE_NEW'
                  ? 'Create Staff Member'
                  : 'Assign Staff Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Staff Confirmation Modal */}
      <Dialog open={Boolean(revokingStaff)} onOpenChange={() => setRevokingStaff(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="size-5" />
              <span>Revoke Staff Credentials</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke staff privileges for{' '}
              <strong className="text-ink">{revokingStaff?.name}</strong> ({revokingStaff?.email})?
              This will remove all module access permissions and downgrade their account to standard user.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setRevokingStaff(null)}>
              Keep Staff Status
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevokeStaff}
              disabled={revokeStaffMutation.isPending}
            >
              {revokeStaffMutation.isPending && (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              )}
              Revoke Staff Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
