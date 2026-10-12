import type { OrderStatus } from '@needx/types';

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAYMENT_PENDING', 'CANCELLED'],
  PAYMENT_PENDING: ['PAID', 'CANCELLED'],
  PAID: ['CONFIRMED', 'REFUNDED', 'CANCELLED'],
  CONFIRMED: ['READY', 'CANCELLED', 'DISPUTED'],
  READY: ['ACTIVE', 'CANCELLED', 'DISPUTED'],
  ACTIVE: ['COMPLETED', 'DISPUTED'],
  COMPLETED: ['DISPUTED', 'REFUNDED'],
  CANCELLED: [],
  DISPUTED: ['COMPLETED', 'REFUNDED', 'CANCELLED'],
  REFUNDED: [],
};

/**
 * Encodes the spec's explicit rule: "A cancelled order cannot become
 * completed." — CANCELLED has no outgoing transitions, so this is enforced
 * structurally, not by a special-cased if-statement scattered in services.
 */
export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false;
  return TRANSITIONS[from]?.includes(to) ?? false;
}
