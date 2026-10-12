'use client';

import { useMemo } from 'react';
import {
  BarChart3,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  Package,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { DashboardShell, type NavGroup } from '@/components/dashboard/dashboard-shell';
import { AuthGuard } from '@/components/shared/auth-guard';
import { isUserAdmin, useCurrentUser } from '@/hooks/use-auth';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useCurrentUser();
  const isAdmin = isUserAdmin(user);

  const navGroups: NavGroup[] = useMemo(() => {
    const groups: NavGroup[] = [
      {
        label: 'Provider Hub',
        items: [
          { href: '/provider', label: 'Overview', icon: LayoutDashboard },
          { href: '/provider/requests', label: 'Matching requests', icon: Inbox },
          { href: '/provider/offers', label: 'My offers', icon: Send },
          { href: '/provider/listings', label: 'My listings', icon: Store },
          { href: '/provider/orders', label: 'Orders', icon: ShoppingBag },
        ],
      },
      {
        label: 'Account & Insights',
        items: [
          { href: '/provider/messages', label: 'Messages', icon: MessageCircle },
          { href: '/provider/analytics', label: 'Analytics', icon: BarChart3 },
          { href: '/provider/settings', label: 'Settings', icon: Settings },
        ],
      },
      {
        label: 'Switch Workspace',
        items: [
          { href: '/dashboard', label: 'Seeker Dashboard', icon: Package },
          ...(isAdmin ? [{ href: '/admin', label: 'Admin CRM Ops', icon: ShieldCheck }] : []),
        ],
      },
    ];
    return groups;
  }, [isAdmin]);

  return (
    <AuthGuard requiredRoles={['PROVIDER']} roleFallbackType="provider">
      <DashboardShell title="Provider dashboard" navGroups={navGroups}>
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
