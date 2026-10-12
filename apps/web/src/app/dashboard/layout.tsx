'use client';

import { useMemo } from 'react';
import {
  Bell,
  Heart,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  Package,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tent,
  User as UserIcon,
} from 'lucide-react';
import { DashboardShell, type NavGroup } from '@/components/dashboard/dashboard-shell';
import { AuthGuard } from '@/components/shared/auth-guard';
import { isUserAdmin, isUserProvider, useCurrentUser } from '@/hooks/use-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useCurrentUser();
  const isProvider = isUserProvider(user);
  const isAdmin = isUserAdmin(user);

  const navGroups: NavGroup[] = useMemo(() => {
    const marketplaceItems = [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/dashboard/needs', label: 'My needs', icon: Package },
      ...(isProvider ? [{ href: '/dashboard/listings', label: 'My listings', icon: ShoppingBag }] : []),
      { href: '/dashboard/orders', label: 'Orders & Escrow', icon: ShoppingBag },
      { href: '/dashboard/rentals', label: 'Rentals', icon: Tent },
    ];

    const groups: NavGroup[] = [
      {
        label: 'Seeker Workspace',
        items: marketplaceItems,
      },
    ];

    if (isProvider) {
      groups.push({
        label: 'Provider Hub',
        items: [
          { href: '/provider', label: 'Provider dashboard', icon: Store },
          { href: '/provider/requests', label: 'Matching requests', icon: Inbox },
          { href: '/provider/offers', label: 'My offers', icon: Send },
        ],
      });
    }

    if (isAdmin) {
      groups.push({
        label: 'Platform Ops',
        items: [
          { href: '/admin', label: 'Admin CRM Ops', icon: ShieldCheck },
        ],
      });
    }

    groups.push({
      label: 'Account',
      items: [
        ...(!isProvider ? [{ href: '/dashboard/settings', label: 'Become a Provider', icon: Sparkles }] : []),
        { href: '/dashboard/messages', label: 'Messages', icon: MessageCircle },
        { href: '/dashboard/favorites', label: 'Favorites', icon: Heart },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { href: '/dashboard/profile', label: 'Profile', icon: UserIcon },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ],
    });

    return groups;
  }, [isProvider, isAdmin]);

  return (
    <AuthGuard>
      <DashboardShell title="Dashboard" navGroups={navGroups}>
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
