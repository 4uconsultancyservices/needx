'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavGroup {
  label?: string;
  items: Array<{ href: string; label: string; icon: LucideIcon }>;
}

export function DashboardShell({ title, navGroups, children }: { title: string; navGroups: NavGroup[]; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">{title}</h1>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-6">
            {navGroups.map((group, i) => (
              <div key={i}>
                {group.label && <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">{group.label}</p>}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = item.href === pathname || (item.href !== '/dashboard' && item.href !== '/provider' && item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium transition-all',
                          active ? 'bg-trust text-white shadow-sm' : 'text-ink-soft hover:bg-trust-soft/60 hover:text-trust',
                        )}
                      >
                        <item.icon className="size-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 -mx-1 flex gap-1 overflow-x-auto pb-1 lg:hidden">
            {navGroups.flatMap((g) => g.items).map((item) => {
              const active = item.href === pathname;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    active ? 'border-trust bg-trust text-white shadow-sm' : 'border-border bg-surface text-ink-soft',
                  )}
                >
                  <item.icon className="size-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
