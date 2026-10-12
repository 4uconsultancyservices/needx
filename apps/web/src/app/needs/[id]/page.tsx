'use client';

import { use } from 'react';
import Link from 'next/link';
import { MapPin, Pencil, Wallet, X } from 'lucide-react';
import { useNeed, useNeedMatches } from '@/hooks/use-needs';
import { useOffersForNeed } from '@/hooks/use-offers';
import { useCurrentUser } from '@/hooks/use-auth';
import { useListing } from '@/hooks/use-listings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/listings/listing-card';
import { OfferCard } from '@/components/offers/offer-card';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useCancelNeed } from '@/hooks/use-needs';
import { TRANSACTION_MODE_LABELS } from '@/lib/utils';
import { Inbox, PackageSearch } from 'lucide-react';

export default function NeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: need, isLoading } = useNeed(id);
  const { data: matches, isLoading: matchesLoading } = useNeedMatches(id);
  const { data: offers } = useOffersForNeed(id);
  const { data: user } = useCurrentUser();
  const cancelNeed = useCancelNeed();

  if (isLoading || !need) {
    return <div className="mx-auto max-w-4xl px-4 py-14"><CardGridSkeleton count={3} /></div>;
  }

  const isOwner = user?.id === need.userId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="card-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant={need.status === 'ACTIVE' || need.status === 'MATCHING' ? 'hope' : need.status === 'FULFILLED' ? 'faith' : 'default'}>{need.status}</Badge>
              {need.modes.map((m) => (
                <Badge key={m} variant="trust">
                  {TRANSACTION_MODE_LABELS[m]}
                </Badge>
              ))}
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{need.title}</h1>
          </div>
          {isOwner && ['ACTIVE', 'MATCHING'].includes(need.status) && (
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/needs/${need.id}`}>
                  <Pencil /> Edit
                </Link>
              </Button>
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="sm">
                    <X /> Cancel
                  </Button>
                }
                title="Cancel this need?"
                description="Providers will no longer be able to make offers on it."
                destructive
                confirmLabel="Cancel need"
                onConfirm={() => cancelNeed.mutate(need.id)}
              />
            </div>
          )}
        </div>
        {need.description && <p className="mt-4 text-sm text-ink-soft">{need.description}</p>}
        <div className="mt-5 flex flex-wrap gap-5 border-t border-border pt-4 text-sm">
          <span className="flex items-center gap-1.5 text-ink-soft">
            <Wallet className="size-4 text-ink-faint" />
            {need.budget?.max ? `Up to ₹${need.budget.max.toLocaleString('en-IN')}` : 'Budget not set'}
          </span>
          <span className="flex items-center gap-1.5 text-ink-soft">
            <MapPin className="size-4 text-ink-faint" />
            {need.location.label}
          </span>
        </div>
      </div>

      {isOwner && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">Offers received {offers && offers.length > 0 && `(${offers.length})`}</h2>
          <div className="mt-4 space-y-3">
            {!offers || offers.length === 0 ? (
              <EmptyState icon={Inbox} title="No offers yet" description="Providers matching this need will be notified — check back soon." />
            ) : (
              offers.map((offer) => <OfferCard key={offer.id} offer={offer} perspective="owner" />)
            )}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Matching listings</h2>
        <p className="mt-1 text-sm text-ink-soft">Ranked by category fit, distance, price, and provider reliability.</p>
        <div className="mt-4">
          {matchesLoading ? (
            <CardGridSkeleton count={3} />
          ) : !matches || matches.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No matches yet" description="We'll keep looking as new listings are added nearby." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((match) => (
                <div key={match.listingId} className="relative">
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-trust text-white px-2.5 py-1 font-mono-num text-xs font-semibold shadow-xs">
                    {match.score}% match
                  </span>
                  <ListingCardById listingId={match.listingId} distanceKm={match.distanceKm} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ListingCardById({ listingId, distanceKm }: { listingId: string; distanceKm?: number }) {
  const { data: listing } = useListing(listingId);
  if (!listing) return null;
  return <ListingCard listing={listing} distanceKm={distanceKm} />;
}
