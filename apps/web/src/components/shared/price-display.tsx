import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

const UNIT_SUFFIX: Record<string, string> = { DAY: '/day', HOUR: '/hr', SERVICE: '/service', ITEM: '' };

export function PriceDisplay({ amount, currency = 'INR', unit, className }: { amount: number; currency?: string; unit?: string; className?: string }) {
  if (amount === 0) {
    return <span className={cn('font-mono-num font-semibold text-signal', className)}>Free</span>;
  }
  return (
    <span className={cn('font-mono-num font-semibold text-ink', className)}>
      {formatPrice(amount, currency)}
      {unit && <span className="ml-0.5 font-sans text-xs font-normal text-ink-faint">{UNIT_SUFFIX[unit] ?? ''}</span>}
    </span>
  );
}
