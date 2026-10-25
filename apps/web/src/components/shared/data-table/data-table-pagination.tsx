'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  selectedCount?: number;
  className?: string;
}

export function DataTablePagination({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  selectedCount = 0,
  className,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  // Generate numbered pages with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between border-t border-border/80 bg-surface/50 text-xs text-ink-faint',
        className,
      )}
    >
      {/* Left side: selected info & range summary */}
      <div className="flex flex-wrap items-center gap-3">
        {selectedCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-trust/10 px-2.5 py-0.5 text-xs font-semibold text-trust">
            <span className="size-1.5 rounded-full bg-trust animate-pulse" />
            {selectedCount} of {totalItems} selected
          </span>
        ) : (
          <span>
            Showing <strong className="font-semibold text-ink">{startItem}</strong> to{' '}
            <strong className="font-semibold text-ink">{endItem}</strong> of{' '}
            <strong className="font-semibold text-ink">{totalItems}</strong> entries
          </span>
        )}

        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 border-l border-border/80 pl-3">
            <span className="text-[11px]">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-7 w-[68px] text-xs font-medium bg-surface">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right side: navigation buttons & numeric pagination */}
      <div className="flex items-center gap-1 self-end sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          className="size-7 p-0"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          title="First Page"
        >
          <ChevronsLeft className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="size-7 p-0"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          title="Previous Page"
        >
          <ChevronLeft className="size-3.5" />
        </Button>

        {/* Page number buttons */}
        <div className="hidden sm:flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === 'string' ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-ink-faint text-xs">
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={page === p ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'size-7 p-0 text-xs font-medium',
                  page === p
                    ? 'bg-trust text-white hover:bg-trust/90 shadow-xs'
                    : 'text-ink-soft hover:bg-canvas-alt',
                )}
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ),
          )}
        </div>

        <span className="sm:hidden text-[11px] font-medium text-ink px-2">
          {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          className="size-7 p-0"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          title="Next Page"
        >
          <ChevronRight className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="size-7 p-0"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          title="Last Page"
        >
          <ChevronsRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
