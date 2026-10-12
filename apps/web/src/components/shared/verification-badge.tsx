import { BadgeCheck, ShieldCheck, Zap, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  type: 'verified' | 'fast-responder' | 'top-provider' | 'business-verified';
  className?: string;
}

const CONFIG = {
  verified: { icon: BadgeCheck, label: 'Verified', color: 'text-trust' },
  'business-verified': { icon: ShieldCheck, label: 'Business verified', color: 'text-faith' },
  'fast-responder': { icon: Zap, label: 'Fast responder', color: 'text-hope' },
  'top-provider': { icon: Trophy, label: 'Top provider', color: 'text-amber-500' },
};

/** Only ever rendered when the underlying trust criteria are actually met —
 * see components/providers/provider-badges.tsx for the gating logic. */
export function VerificationBadge({ type, className }: VerificationBadgeProps) {
  const { icon: Icon, label, color } = CONFIG[type];
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', color, className)}>
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
