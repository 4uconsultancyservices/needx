'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home, MessageCircle, Plus, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-auth';

const ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/needs/new', icon: Plus, label: 'Need', prominent: true },
  { href: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/dashboard/profile', icon: UserIcon, label: 'Profile' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  // Hidden inside dashboard/provider/admin shells, which have their own nav,
  // and on auth pages.
  if (/^\/(dashboard|provider|admin|login|register|forgot-password|verify)/.test(pathname)) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {ITEMS.map(({ href, icon: Icon, label, prominent }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          const finalHref = label === 'Messages' || label === 'Profile' ? (user ? href : '/login') : href;

          if (prominent) {
            return (
              <Link key={href} href={finalHref} className="flex flex-col items-center gap-1 px-3 py-1">
                <span className="flex size-12 -translate-y-3.5 items-center justify-center rounded-full bg-gradient-to-tr from-[#0f294a] via-[#1e40af] to-[#0d9488] text-white shadow-md ring-4 ring-surface transition-transform active:scale-95">
                  <Icon className="size-5 stroke-[2.5]" />
                </span>
                <span className="sr-only">{label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={finalHref}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium transition-colors',
                active ? 'text-trust dark:text-trust font-semibold' : 'text-ink-soft/70 hover:text-ink',
              )}
            >
              <Icon className={cn('size-5 transition-transform', active ? 'text-trust dark:text-trust scale-105' : 'text-ink-faint')} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
