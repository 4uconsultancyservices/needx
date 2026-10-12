import * as React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-24 w-full rounded-control border border-border bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-faint',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/30 focus-visible:border-trust',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
