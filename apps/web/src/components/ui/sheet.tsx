'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'bottom' | 'right';
}

const sideClasses: Record<NonNullable<SheetContentProps['side']>, string> = {
  bottom:
    'inset-x-0 bottom-0 max-h-[85vh] rounded-t-[1.5rem] border-t data-[state=open]:animate-fade-up safe-bottom',
  right: 'inset-y-0 right-0 h-full w-[90vw] max-w-sm border-l',
};

export function SheetContent({ className, children, side = 'bottom', ...props }: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        className={cn('fixed z-50 border-border bg-surface p-5 shadow-card-hover focus:outline-none', sideClasses[side], className)}
        {...props}
      >
        {side === 'bottom' && <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" aria-hidden />}
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1.5 text-ink-faint hover:bg-canvas-alt hover:text-ink">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 space-y-1', className)} {...props} />;
}
export function SheetTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('font-display text-lg font-semibold text-ink', className)} {...props} />;
}
export function SheetDescription({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-xs text-ink-soft', className)} {...props} />;
}
