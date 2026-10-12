'use client';

import Link from 'next/link';
import { Bell, BellOff } from 'lucide-react';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/use-misc';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { Button } from '@/components/ui/button';
import { cn, formatRelativeTime } from '@/lib/utils';

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (isLoading) return <CardGridSkeleton count={4} />;
  if (!data || data.data.length === 0) {
    return <EmptyState icon={BellOff} title="No notifications" description="You'll see updates about your needs, offers, and orders here." />;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
          Mark all read
        </Button>
      </div>
      <div className="space-y-2">
        {data.data.map((n) => (
          <Link
            key={n.id}
            href={n.linkUrl ?? '#'}
            onClick={() => !n.read && markRead.mutate(n.id)}
            className={cn('card-surface flex items-start gap-3 p-4 transition-colors hover:shadow-card-hover', !n.read && 'border-hope/30 bg-hope-soft/40')}
          >
            <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full', n.read ? 'bg-canvas-alt text-ink-faint' : 'bg-hope text-white')}>
              <Bell className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{n.title}</p>
              <p className="text-xs text-ink-soft">{n.body}</p>
              <p className="mt-0.5 text-[11px] text-ink-faint">{formatRelativeTime(n.createdAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
