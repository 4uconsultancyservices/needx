import type { TrustInfo } from '@needx/types';
import { VerificationBadge } from '@/components/shared/verification-badge';

/**
 * The single gate for which trust badges render — thresholds live here and
 * ONLY here, so a badge can never show up without its criteria being met.
 */
export function ProviderBadges({ trust, className }: { trust: TrustInfo; className?: string }) {
  const badges: React.ReactNode[] = [];

  if (trust.businessVerified) {
    badges.push(<VerificationBadge key="biz" type="business-verified" />);
  } else if (trust.identityVerified || (trust.phoneVerified && trust.emailVerified)) {
    badges.push(<VerificationBadge key="verified" type="verified" />);
  }

  if (trust.responseRate >= 0.9 && (trust.avgResponseMinutes === undefined || trust.avgResponseMinutes <= 60)) {
    badges.push(<VerificationBadge key="fast" type="fast-responder" />);
  }

  if (trust.ratingAverage >= 4.5 && trust.ratingCount >= 5 && trust.completedTransactions >= 10) {
    badges.push(<VerificationBadge key="top" type="top-provider" />);
  }

  if (badges.length === 0) return null;
  return <div className={className ?? 'flex flex-wrap items-center gap-2.5'}>{badges}</div>;
}
