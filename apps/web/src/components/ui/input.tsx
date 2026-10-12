import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-ink-faint',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/30 focus-visible:border-trust',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
