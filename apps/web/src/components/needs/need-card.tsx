import Link from 'next/link';
import type { Need } from '@needx/types';
import { Badge } from '@/components/ui/badge';
import { PriceDisplay } from '@/components/shared/price-display';
import { LocationDisplay } from '@/components/shared/location-display';
import { formatRelativeTime, TRANSACTION_MODE_LABELS } from '@/lib/utils';

const STATUS_VARIANT: Record<string, 'default' | 'accent' | 'signal' | 'danger' | 'trust' | 'hope' | 'faith'> = {
  ACTIVE: 'faith',
  MATCHING: 'hope',
  FULFILLED: 'trust',
  EXPIRED: 'default',
  CANCELLED: 'danger',
  DRAFT: 'default',
};

export function NeedCard({ need, href }: { need: Need; href?: string }) {
  return (
    <Link
      href={href ?? `/needs/${need.id}`}
      className="card-surface group flex flex-col gap-2.5 p-4.5 transition-all duration-300 hover:shadow-card-hover hover:border-hope/30"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 font-semibold text-ink group-hover:text-hope transition-colors">{need.title}</h3>
        <Badge variant={STATUS_VARIANT[need.status] ?? 'default'}>{need.status}</Badge>
      </div>
      <p className="line-clamp-2 text-xs text-ink-soft">{need.description || 'No further details provided.'}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {need.modes.map((m) => (
          <Badge key={m} variant="outline">
            {TRANSACTION_MODE_LABELS[m]}
          </Badge>
        ))}
      </div>
      <div className="mt-1 flex items-center justify-between border-t border-border pt-2.5">
        <LocationDisplay label={need.location.city ?? need.location.label} />
        <div className="flex items-center gap-3">
          {need.budget?.max && <PriceDisplay amount={need.budget.max} currency={need.budget.currency} />}
          <span className="text-xs text-ink-faint">{formatRelativeTime(need.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
