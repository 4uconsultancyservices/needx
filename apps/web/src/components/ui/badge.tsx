import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', {
  variants: {
    variant: {
      default: 'bg-canvas-alt text-ink-soft border border-border/60',
      accent: 'bg-accent-soft text-accent-deep font-medium border border-accent/20',
      trust: 'bg-trust-soft text-trust font-medium border border-trust/20',
      hope: 'bg-hope-soft text-hope-deep font-medium border border-hope/20',
      faith: 'bg-faith-soft text-faith-deep font-medium border border-faith/20',
      signal: 'bg-faith-soft text-faith font-medium border border-faith/20',
      danger: 'bg-danger-soft text-danger border border-danger/20',
      outline: 'border border-border text-ink-soft bg-surface/60',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
