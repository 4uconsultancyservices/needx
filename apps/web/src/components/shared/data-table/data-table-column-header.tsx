'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortDirection } from './types';

interface DataTableColumnHeaderProps {
  title: React.ReactNode;
  sortable?: boolean;
  isSorted: SortDirection;
  onSortToggle?: () => void;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function DataTableColumnHeader({
  title,
  sortable,
  isSorted,
  onSortToggle,
  className,
  align = 'left',
}: DataTableColumnHeaderProps) {
  if (!sortable || !onSortToggle) {
    return (
      <div
        className={cn(
          'text-[11px] font-bold uppercase tracking-wider text-ink-faint',
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          className,
        )}
      >
        {title}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSortToggle}
      className={cn(
        'group inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-faint transition-colors hover:text-ink',
        isSorted && 'text-trust font-extrabold',
        align === 'center' && 'justify-center mx-auto',
        align === 'right' && 'justify-end ml-auto',
        className,
      )}
    >
      <span>{title}</span>
      <span className="flex size-4 items-center justify-center rounded-sm transition-colors group-hover:bg-trust-soft/40">
        {isSorted === 'asc' ? (
          <ArrowUp className="size-3 text-trust stroke-[2.5]" />
        ) : isSorted === 'desc' ? (
          <ArrowDown className="size-3 text-trust stroke-[2.5]" />
        ) : (
          <ArrowUpDown className="size-3 opacity-40 group-hover:opacity-100" />
        )}
      </span>
    </button>
  );
}
