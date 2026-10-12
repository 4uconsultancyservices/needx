import type { OfferStatus } from '@needx/types';

const TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  SENT: ['VIEWED', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
  VIEWED: ['COUNTERED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
  COUNTERED: ['COUNTERED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
  CANCELLED: [],
};

/**
 * Encodes, among other things, the spec's explicit business rules:
 * "A rejected offer cannot be accepted." / "An expired offer cannot be
 * accepted." — both fall out naturally from REJECTED/EXPIRED being terminal.
 */
export function canTransitionOffer(from: OfferStatus, to: OfferStatus): boolean {
  if (from === to) return to === 'COUNTERED'; // repeated counters are allowed
  return TRANSITIONS[from]?.includes(to) ?? false;
}
