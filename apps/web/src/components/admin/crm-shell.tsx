'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Banknote,
  Bell,
  CreditCard,
  Crown,
  ExternalLink,
  FileWarning,
  Gavel,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  ScrollText,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Star,
  Store,
  Tag,
  User as UserIcon,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import type { StaffModule } from '@needx/types';
import { isUserProvider, useCurrentUser, useLogout } from '@/hooks/use-auth';
import { useAdminDashboard } from '@/hooks/use-admin';
import { useMyStaffProfile } from '@/hooks/use-staff';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, initials } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CrmNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'openDisputes' | 'openReports' | 'activeNeeds';
  moduleKey: StaffModule;
}

interface CrmNavSection {
  title: string;
  items: CrmNavItem[];
}

const CRM_SECTIONS: CrmNavSection[] = [
  {
    title: 'Executive & Customer CRM',
    items: [
      { href: '/admin', label: 'Command Center', icon: LayoutDashboard, moduleKey: 'dashboard' },
      { href: '/admin/users', label: 'Customer 360', icon: Users, moduleKey: 'users' },
    ],
  },
  {
    title: 'Marketplace Operations',
    items: [
      { href: '/admin/needs', label: 'Needs Demand Pipeline', icon: Package, badgeKey: 'activeNeeds', moduleKey: 'needs' },
      { href: '/admin/listings', label: 'Provider Inventory', icon: ShoppingBag, moduleKey: 'listings' },
      { href: '/admin/orders', label: 'Orders & Escrow', icon: CreditCard, moduleKey: 'orders' },
      { href: '/admin/payments', label: 'Treasury & Ledger', icon: Banknote, moduleKey: 'payments' },
      { href: '/admin/categories', label: 'Taxonomy & Catalog', icon: Tag, moduleKey: 'categories' },
    ],
  },
  {
    title: 'Trust & Case Resolution',
    items: [
      { href: '/admin/reports', label: 'Incident Reports', icon: FileWarning, badgeKey: 'openReports', moduleKey: 'reports' },
      { href: '/admin/disputes', label: 'Dispute Arbitration', icon: Gavel, badgeKey: 'openDisputes', moduleKey: 'disputes' },
      { href: '/admin/moderation', label: 'Audit Trail & Logs', icon: ScrollText, moduleKey: 'moderation' },
      { href: '/admin/reviews', label: 'CSAT & Reviews', icon: Star, moduleKey: 'reviews' },
    ],
  },
  {
    title: 'Platform Config',
    items: [
      { href: '/admin/staff', label: 'Staff & Roles', icon: UserCheck, moduleKey: 'staff' },
      { href: '/admin/notifications', label: 'Broadcast Studio', icon: Bell, moduleKey: 'notifications' },
      { href: '/admin/settings', label: 'Match Engine & Fees', icon: Sliders, moduleKey: 'settings' },
    ],
  },
];

function hasModuleAccess(
  moduleKey: StaffModule,
  permissions?: string[],
  isSuperAdmin?: boolean,
): boolean {
  if (isSuperAdmin) return true;
  if (!permissions || permissions.length === 0) return false;
  if (permissions.includes('*')) return true;
  if (permissions.includes(`${moduleKey}:*`)) return true;
  return permissions.some((p) => p.startsWith(`${moduleKey}:`));
}

export function CrmShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const { data: staffData } = useMyStaffProfile();
  const logout = useLogout();
  const isProvider = isUserProvider(user);
  const { data: stats } = useAdminDashboard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isSuperAdmin = Boolean(
    user?.roles?.includes('SUPER_ADMIN') || staffData?.isSuperAdmin,
  );

  const visibleSections = CRM_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      hasModuleAccess(item.moduleKey, staffData?.permissions, isSuperAdmin),
    ),
  })).filter((section) => section.items.length > 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['admin'] });
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const getSectionBadge = (badgeKey?: 'openDisputes' | 'openReports' | 'activeNeeds') => {
    if (!stats || !badgeKey) return null;
    const count =
      badgeKey === 'openDisputes'
        ? stats.openDisputes
        : badgeKey === 'openReports'
        ? stats.openReports
        : badgeKey === 'activeNeeds'
        ? stats.activeNeeds
        : 0;
    if (!count || count <= 0) return null;
    return (
      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger/15 px-1.5 text-[11px] font-semibold text-danger">
        {count}
      </span>
    );
  };

  // Quick navigation items for command palette filtered by staff access
  const allNavItems = visibleSections.flatMap((s) => s.items);
  const filteredNavItems = paletteQuery
    ? allNavItems.filter((i) => i.label.toLowerCase().includes(paletteQuery.toLowerCase()))
    : allNavItems;

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-ink antialiased dark:bg-[#080d1a]">
      {/* Top Enterprise Command Bar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-ink-soft hover:bg-canvas-alt hover:text-ink lg:hidden"
              aria-label="Toggle Navigation"
            >
              <Menu className="size-5" />
            </button>

            {/* Brand Logo & CRM Title */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f294a] via-[#1e40af] to-[#0d9488] shadow-sm ring-1 ring-white/20">
                  <span className="font-display text-base font-extrabold tracking-tight text-white">N</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold tracking-tight text-ink">NEEDX</span>
                    <span className="rounded-md bg-trust/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-trust">
                      CRM Ops
                    </span>
                  </div>
                  <p className="text-[10px] text-ink-faint">Enterprise Operations Suite</p>
                </div>
              </Link>
            </div>

            <div className="mx-2 hidden h-5 w-px bg-border sm:block" />

            {/* Live Operational Status Pill */}
            <div className="hidden items-center gap-2 rounded-full border border-faith/20 bg-faith-soft/60 px-2.5 py-1 text-xs font-medium text-faith md:flex">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-faith opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-faith" />
              </span>
              <span>Cluster Active · SLA 99.98%</span>
            </div>
          </div>

          {/* Quick Actions & Admin Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Command / Search Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs text-ink-faint transition-colors hover:border-trust hover:text-ink"
            >
              <Search className="size-3.5" />
              <span className="hidden sm:inline">Jump to module...</span>
              <kbd className="hidden rounded bg-canvas-alt px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft sm:inline">
                ⌘K
              </kbd>
            </button>

            {/* Data Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="text-ink-soft hover:text-ink"
              title="Refresh CRM Data"
            >
              <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin text-trust')} />
              <span className="hidden md:inline text-xs">Sync</span>
            </Button>

            {/* Public Platform Switcher */}
            <Button variant="outline" size="sm" asChild className="hidden text-xs sm:inline-flex">
              <Link href="/" target="_blank">
                <ExternalLink className="size-3" />
                <span>Live Marketplace</span>
              </Link>
            </Button>

            {/* Admin Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 border-l border-border rounded-lg p-1 transition-colors hover:bg-canvas-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust text-left">
                  <Avatar className="size-8 ring-1 ring-border">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback className="bg-trust text-white text-xs font-semibold">
                      {user ? initials(user.name) : 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left xl:block">
                    <p className="text-xs font-semibold text-ink leading-none">{user?.name ?? 'Admin'}</p>
                    <p className="mt-0.5 text-[10px] text-ink-faint font-mono">
                      {isSuperAdmin
                        ? 'Super Admin'
                        : staffData?.designation || (user?.roles?.includes('STAFF') ? 'Staff Specialist' : 'Operator')}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 shadow-card-hover">
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-canvas-alt/60 mb-1 border border-border/50">
                  <Avatar className="size-9 ring-1 ring-border shrink-0">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback className="bg-trust text-white text-xs font-semibold">
                      {user ? initials(user.name) : 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-ink truncate">{user?.name ?? 'Admin'}</p>
                    <p className="text-[10px] text-ink-faint truncate">{user?.email}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <span className="inline-flex items-center gap-1 rounded bg-[#0f294a] px-1.5 py-0.5 text-[9px] font-bold text-dawn uppercase tracking-wider">
                        <Crown className="size-2.5 text-dawn" />
                        {isSuperAdmin ? 'Super Admin' : staffData?.designation || 'Staff'}
                      </span>
                      {staffData?.department && (
                        <span className="rounded bg-faith/15 px-1.5 py-0.5 text-[9px] font-semibold text-faith uppercase">
                          {staffData.department.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-ink-faint px-2 py-1">
                  Switch Workspace
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="size-4 text-ink-soft" />
                    <span>Seeker Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                {isProvider && (
                  <DropdownMenuItem asChild>
                    <Link href="/provider" className="flex items-center gap-2">
                      <Store className="size-4 text-hope" />
                      <span>Provider Hub</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/" target="_blank" className="flex items-center gap-2">
                    <ExternalLink className="size-4 text-ink-soft" />
                    <span>Live Marketplace</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center gap-2">
                    <UserIcon className="size-4 text-ink-soft" />
                    <span>Account Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2">
                    <Sliders className="size-4 text-ink-soft" />
                    <span>Preferences</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-danger focus:bg-danger-soft focus:text-danger cursor-pointer"
                  onClick={async () => {
                    await logout.mutateAsync();
                    router.push('/');
                  }}
                >
                  <LogOut className="size-4 text-danger" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main CRM Workspace Grid */}
      <div className="mx-auto flex max-w-[1720px]">
        {/* CRM Operations Sidebar (Desktop) */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r border-border/80 bg-surface/70 backdrop-blur-sm lg:flex">
          <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-5">
            <div className="space-y-6">
              {visibleSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                    {section.title}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const active =
                        item.href === pathname ||
                        (item.href !== '/admin' && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all',
                            active
                              ? 'bg-trust text-white shadow-xs'
                              : 'text-ink-soft hover:bg-trust-soft/60 hover:text-trust',
                          )}
                        >
                          <item.icon
                            className={cn(
                              'size-4 transition-colors',
                              active ? 'text-white' : 'text-ink-faint group-hover:text-trust',
                            )}
                          />
                          <span>{item.label}</span>
                          {getSectionBadge(item.badgeKey)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Footer info */}
            <div className="mt-6 border-t border-border pt-4">
              <div className="rounded-xl border border-trust/15 bg-trust-soft/40 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-trust" />
                    <span className="text-xs font-bold text-ink">Trust Engine v2.4</span>
                  </div>
                  <Badge variant="trust" className="text-[10px] px-1.5 py-0">Online</Badge>
                </div>
                <p className="mt-1 text-[11px] text-ink-soft">
                  Real-time match scoring and automated fraud sentinel active.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 flex w-72 flex-col bg-surface p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="font-display font-bold text-ink">NEEDX CRM Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-ink-soft hover:bg-canvas-alt"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="mt-4 flex-1 overflow-y-auto space-y-5">
                {visibleSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const active =
                          item.href === pathname ||
                          (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold',
                              active ? 'bg-trust text-white' : 'text-ink-soft hover:bg-canvas-alt',
                            )}
                          >
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                            {getSectionBadge(item.badgeKey)}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Primary Content Viewport */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>

      {/* Command Palette Modal (Ctrl+K) */}
      <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <div className="flex items-center border-b border-border px-4 py-3">
            <Search className="mr-2.5 size-4 text-ink-faint" />
            <Input
              value={paletteQuery}
              onChange={(e) => setPaletteQuery(e.target.value)}
              placeholder="Search CRM operations, modules, customers..."
              className="border-0 p-0 text-sm focus-visible:ring-0 shadow-none h-8"
              autoFocus
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase text-ink-faint">CRM Workspaces</p>
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setCommandPaletteOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-ink hover:bg-trust hover:text-white transition-colors"
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
                <ArrowUpRight className="ml-auto size-3 opacity-60" />
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
