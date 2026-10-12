import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  total?: number;
  limit?: number;
}

export function Pagination({ page, hasMore, onPageChange, total, limit }: PaginationProps) {
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-ink-faint">{total !== undefined && limit ? `Page ${page} of ${Math.max(1, Math.ceil(total / limit))} · ${total} total` : `Page ${page}`}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft /> Prev
        </Button>
        <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => onPageChange(page + 1)}>
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
