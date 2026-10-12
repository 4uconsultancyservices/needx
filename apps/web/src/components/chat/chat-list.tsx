'use client';

import type { Conversation } from '@needx/types';
import { cn, formatRelativeTime } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export function ChatList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  currentUserId?: string;
}) {
  if (conversations.length === 0) {
    return <EmptyState icon={MessageCircle} title="No conversations yet" description="Conversations start once you have an active offer or order." />;
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={cn('flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-canvas-alt', activeId === c.id && 'bg-canvas-alt')}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink">{c.contextType} conversation</span>
            {c.lastMessageAt && <span className="text-[11px] text-ink-faint">{formatRelativeTime(c.lastMessageAt)}</span>}
          </div>
          {c.lastMessagePreview && <p className="line-clamp-1 text-xs text-ink-soft">{c.lastMessagePreview}</p>}
        </button>
      ))}
    </div>
  );
}
