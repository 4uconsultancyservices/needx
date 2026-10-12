import Link from 'next/link';
import type { Order } from '@needx/types';
import { Badge } from '@/components/ui/badge';
import { PriceDisplay } from '@/components/shared/price-display';
import { formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';

const STATUS_VARIANT: Record<string, 'default' | 'accent' | 'signal' | 'danger'> = {
  PENDING: 'default',
  PAYMENT_PENDING: 'accent',
  PAID: 'accent',
  CONFIRMED: 'accent',
  READY: 'accent',
  ACTIVE: 'signal',
  COMPLETED: 'signal',
  CANCELLED: 'danger',
  DISPUTED: 'danger',
  REFUNDED: 'default',
};

export function OrderCard({ order, basePath }: { order: Order; basePath: string }) {
  return (
    <Link href={`${basePath}/${order.id}`} className="card-surface flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-card-hover">
      <div>
        <p className="font-mono-num text-xs text-ink-faint">#{order.id.slice(-8).toUpperCase()}</p>
        <p className="mt-0.5 font-medium text-ink">{order.type} order</p>
        <p className="text-xs text-ink-faint">{formatDate(order.createdAt)}</p>
      </div>
      <div className="text-right">
        <PriceDisplay amount={order.amount} currency={order.currency} />
        <Badge variant={STATUS_VARIANT[order.status]} className="mt-1.5">
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>
    </Link>
  );
}
