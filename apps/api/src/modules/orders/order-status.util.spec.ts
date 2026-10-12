import { canTransitionOrder } from './order-status.util';
import { ORDER_STATUSES } from '@needx/types';

describe('canTransitionOrder', () => {
  it('allows the standard happy path end to end', () => {
    const happyPath: Array<Parameters<typeof canTransitionOrder>> = [
      ['PENDING', 'PAYMENT_PENDING'],
      ['PAYMENT_PENDING', 'PAID'],
      ['PAID', 'CONFIRMED'],
      ['CONFIRMED', 'READY'],
      ['READY', 'ACTIVE'],
      ['ACTIVE', 'COMPLETED'],
    ];
    for (const [from, to] of happyPath) {
      expect(canTransitionOrder(from, to)).toBe(true);
    }
  });

  it('never allows a cancelled order to become completed (spec §67)', () => {
    expect(canTransitionOrder('CANCELLED', 'COMPLETED')).toBe(false);
  });

  it('CANCELLED is a true terminal state — no transitions out at all', () => {
    for (const to of ORDER_STATUSES) {
      expect(canTransitionOrder('CANCELLED', to)).toBe(false);
    }
  });

  it('REFUNDED is also terminal', () => {
    for (const to of ORDER_STATUSES) {
      expect(canTransitionOrder('REFUNDED', to)).toBe(false);
    }
  });

  it('rejects skipping straight from PENDING to COMPLETED', () => {
    expect(canTransitionOrder('PENDING', 'COMPLETED')).toBe(false);
  });

  it('rejects a no-op transition to the same state', () => {
    expect(canTransitionOrder('PAID', 'PAID')).toBe(false);
  });

  it('allows disputes to resolve into COMPLETED, REFUNDED, or CANCELLED', () => {
    expect(canTransitionOrder('DISPUTED', 'COMPLETED')).toBe(true);
    expect(canTransitionOrder('DISPUTED', 'REFUNDED')).toBe(true);
    expect(canTransitionOrder('DISPUTED', 'CANCELLED')).toBe(true);
  });

  it('every non-terminal status can reach DISPUTED or CANCELLED except PENDING/PAYMENT_PENDING (pre-payment, nothing to dispute yet)', () => {
    expect(canTransitionOrder('CONFIRMED', 'DISPUTED')).toBe(true);
    expect(canTransitionOrder('ACTIVE', 'DISPUTED')).toBe(true);
    expect(canTransitionOrder('PENDING', 'DISPUTED')).toBe(false);
  });
});
