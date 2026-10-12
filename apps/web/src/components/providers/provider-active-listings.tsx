'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useListingSearch } from '@/hooks/use-listings';
import { ShieldCheck, Package, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/shared/price-display';

interface ProviderActiveListingsProps {
  providerId: string;
  providerName: string;
}

export function ProviderActiveListings({ providerId, providerName }: ProviderActiveListingsProps) {
  const { data, isLoading } = useListingSearch({ providerId, limit: 12 });
  const listings = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="mt-8 space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-canvas-alt" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-canvas-alt" />
          ))}
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="card-surface mt-8 p-8 text-center border border-dashed border-border">
        <Package className="mx-auto size-10 text-ink-faint" />
        <h3 className="mt-3 font-display text-base font-semibold text-ink">No Active Listings Yet</h3>
        <p className="mt-1 text-sm text-ink-soft">
          {providerName} does not have any active inventory listed in the public catalog at the moment.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Active Equipment & Services ({listings.length})
          </h2>
          <p className="text-xs text-ink-soft">
            Verified inventory available directly from {providerName}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {listings.map((item) => {
          const coverImage = item.images?.[0] || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80';
          return (
            <Link
              key={item.id}
              href={`/listings/${item.id}`}
              className="card-surface group flex flex-col overflow-hidden border border-border/80 transition-all hover:border-trust/40 hover:shadow-card-hover"
            >
              {/* Image Preview */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-canvas-alt">
                <Image
                  src={coverImage}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {item.condition && (
                  <span className="absolute left-3 top-3 rounded-full bg-ink/75 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                    {item.condition}
                  </span>
                )}
                {item.protection?.damageProtectionPlan && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-trust/90 px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm">
                    <ShieldCheck className="size-3" />
                    Protected
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-1 font-display text-base font-semibold text-ink group-hover:text-trust">
                  {item.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-ink-soft">
                  {item.description}
                </p>

                <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="text-xs text-ink-faint">Starting at</div>
                    <PriceDisplay amount={item.price.amount} currency={item.price.currency} unit={item.price.unit} className="text-sm" />
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-trust group-hover:translate-x-0.5 transition-transform">
                    View
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
