import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RatingStars({ value, count, size = 'sm' }: { value: number; count?: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'sm' ? 'size-3.5' : 'size-4';
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(starSize, i < Math.round(value) ? 'fill-accent text-accent' : 'fill-none text-border')}
          />
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-ink-faint">({count})</span>}
    </div>
  );
}
