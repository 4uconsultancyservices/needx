'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNeedSearch } from '@/hooks/use-needs';
import { NeedCard } from '@/components/needs/need-card';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { PackageSearch } from 'lucide-react';

export function NeedSection({
  title = 'Active community needs',
  subtitle = 'People looking for products and services right now.',
  href = '/explore',
}: {
  title?: string;
  subtitle?: string;
  href?: string;
}) {
  const { data, isLoading } = useNeedSearch({ page: 1 });

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl bg-hope-soft text-hope border border-hope/20 shadow-sm">
              <Sparkles className="size-3.5" />
            </span>
            <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
          </div>
          {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-semibold text-hope hover:text-hope-deep hover:underline transition-colors"
        >
          Explore all <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No active needs posted yet"
          description="Be the first to post a need and get matched with providers nearby."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.data.slice(0, 4).map((need) => (
            <NeedCard key={need.id} need={need} />
          ))}
        </div>
      )}
    </section>
  );
}
