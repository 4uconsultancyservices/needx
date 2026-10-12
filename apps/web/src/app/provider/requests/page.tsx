'use client';

import { useQuery } from '@tanstack/react-query';
import { Inbox } from 'lucide-react';
import { useMyListings } from '@/hooks/use-listings';
import { useNeed } from '@/hooks/use-needs';
import { listingsApi } from '@/lib/api/listings';
import { NeedCard } from '@/components/needs/need-card';
import { OfferComposer } from '@/components/offers/offer-composer';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';

function useMatchingNeedIds() {
  const { data: listings } = useMyListings({ page: 1, status: 'ACTIVE' });
  return useQuery({
    queryKey: ['provider', 'matching-needs', listings?.data.map((l) => l.id)],
    queryFn: async () => {
      const results = await Promise.all((listings?.data ?? []).map((l) => listingsApi.matchingNeeds(l.id)));
      const best = new Map<string, number>();
      for (const list of results) {
        for (const { needId, score } of list) {
          best.set(needId, Math.max(best.get(needId) ?? 0, score));
        }
      }
      return [...best.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
    },
    enabled: !!listings,
  });
}

function MatchedNeedCard({ needId, score }: { needId: string; score: number }) {
  const { data: need } = useNeed(needId);
  if (!need) return null;
  return (
    <div className="relative">
      <span className="absolute right-3 top-3 z-10 rounded-full bg-trust text-white px-2.5 py-1 font-mono-num text-xs font-semibold shadow-xs">{score}% match</span>
      <NeedCard need={need} />
      <div className="mt-2">
        <OfferComposer
          need={need}
          trigger={
            <Button size="sm" variant="default" className="w-full">
              Make an offer
            </Button>
          }
        />
      </div>
    </div>
  );
}

export default function ProviderRequestsPage() {
  const { data: matches, isLoading } = useMatchingNeedIds();

  return (
    <div>
      <p className="mb-5 text-sm text-ink-soft">Open needs ranked by fit with your active listings.</p>
      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : !matches || matches.length === 0 ? (
        <EmptyState icon={Inbox} title="No matching needs right now" description="Add or activate a listing to start seeing matches here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {matches.map(([needId, score]) => (
            <MatchedNeedCard key={needId} needId={needId} score={score} />
          ))}
        </div>
      )}
    </div>
  );
}
