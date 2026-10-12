import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminColumn<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

/** Shared CRM table shell used by /admin/* list pages with high-density
 * enterprise ergonomics, consistent loading and empty states. */
export function AdminResourceTable<T>({
  items,
  columns,
  getRowKey,
  isLoading,
  emptyMessage = 'Nothing here yet.',
  className,
}: {
  items: T[] | undefined;
  columns: AdminColumn<T>[];
  getRowKey: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/80 bg-surface p-5 space-y-3 shadow-xs">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-border/80 bg-surface p-8 shadow-xs">
        <EmptyState icon={Inbox} title={emptyMessage} />
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-canvas-alt/50 text-left text-[11px] font-bold uppercase tracking-wider text-ink-faint">
              {columns.map((col) => (
                <th key={col.header} className="whitespace-nowrap px-4 py-3.5 sm:px-5">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((item) => (
              <tr
                key={getRowKey(item)}
                className="transition-colors hover:bg-trust-soft/25"
              >
                {columns.map((col) => (
                  <td
                    key={col.header}
                    className={cn('whitespace-nowrap px-4 py-3.5 sm:px-5 align-middle', col.className)}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
