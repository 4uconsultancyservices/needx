import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-trust text-white hover:bg-trust-deep shadow-sm',
        accent: 'bg-accent text-slate-950 font-semibold hover:bg-accent-deep shadow-sm',
        hope: 'bg-hope text-white hover:bg-hope-deep shadow-sm',
        faith: 'bg-faith text-white hover:bg-faith-deep shadow-sm',
        ink: 'bg-ink text-surface hover:bg-ink-soft shadow-sm',
        outline: 'border border-border bg-surface text-ink hover:bg-canvas-alt',
        ghost: 'text-ink hover:bg-canvas-alt',
        subtle: 'bg-canvas-alt text-ink hover:bg-border/60',
        destructive: 'bg-danger text-white hover:bg-danger/90',
        link: 'text-hope hover:text-hope-deep underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-3.5 text-[13px]',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, children, disabled, ...props }, ref) => {
    // Radix's Slot clones its props onto exactly one child element — it
    // cannot accept the [loading-spinner, children] pair a plain <button>
    // can. asChild is used for navigation (Link) where a spinner doesn't
    // apply anyway, so route it through Slot with only the real children.
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={disabled || loading} {...props}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
