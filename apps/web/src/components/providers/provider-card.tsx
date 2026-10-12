import Link from 'next/link';
import type { PublicUser } from '@needx/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars } from '@/components/shared/rating-stars';
import { ProviderBadges } from './provider-badges';
import { initials } from '@/lib/utils';

export function ProviderCard({ provider }: { provider: PublicUser }) {
  return (
    <Link href={`/providers/${provider.id}`} className="card-surface flex items-center gap-3.5 p-4 transition-shadow hover:shadow-card-hover">
      <Avatar className="size-12">
        <AvatarImage src={provider.avatarUrl} alt={provider.name} />
        <AvatarFallback>{initials(provider.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{provider.provider?.businessName || provider.name}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <RatingStars value={provider.trust.ratingAverage} count={provider.trust.ratingCount} />
          {provider.city && <span className="text-xs text-ink-faint">· {provider.city}</span>}
        </div>
        <ProviderBadges trust={provider.trust} className="mt-1.5 flex flex-wrap gap-2.5" />
      </div>
    </Link>
  );
}
