import type { Message } from '@needx/types';
import { cn, formatRelativeTime } from '@/lib/utils';

export function ChatMessage({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
          isOwn ? 'rounded-br-md bg-trust text-white' : 'rounded-bl-md bg-canvas-alt text-ink',
        )}
      >
        {message.text}
        <div className={cn('mt-1 text-[10px]', isOwn ? 'text-canvas/60' : 'text-ink-faint')}>{formatRelativeTime(message.createdAt)}</div>
      </div>
    </div>
  );
}
