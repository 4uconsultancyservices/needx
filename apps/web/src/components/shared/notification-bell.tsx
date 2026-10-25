'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMarkAllNotificationsRead, useNotifications } from '@/hooks/use-misc';
import { formatRelativeTime, cn } from '@/lib/utils';

export function NotificationBell() {
  const { data } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const unread = data?.meta.unreadCount ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-hope text-[10px] font-bold text-white shadow-sm ring-2 ring-surface">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm p-1.5 shadow-card-hover">
        <div className="flex items-center justify-between px-2.5 py-1.5">
          <DropdownMenuLabel className="p-0 font-semibold text-ink">Notifications</DropdownMenuLabel>
          {unread > 0 && (
            <button onClick={() => markAllRead.mutate()} className="text-xs font-medium text-hope hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {!data || data.data.length === 0 ? (
          <p className="px-2.5 py-6 text-center text-sm text-ink-faint">You&apos;re all caught up.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {data.data.slice(0, 8).map((n) => (
              <DropdownMenuItem key={n.id} asChild className={cn(!n.read && 'bg-canvas-alt/60')}>
                <Link href={n.linkUrl ?? '/dashboard/notifications'} className="flex-col items-start gap-0.5">
                  <span className="text-sm font-medium text-ink">{n.title}</span>
                  <span className="line-clamp-2 text-xs text-ink-soft">{n.body}</span>
                  <span className="text-[11px] text-ink-faint">{formatRelativeTime(n.createdAt)}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/notifications" className="justify-center text-sm font-medium text-trust hover:underline">
            View all
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
