import { canTransitionNeed } from './need-status.util';

describe('canTransitionNeed', () => {
  it('FULFILLED and CANCELLED are terminal', () => {
    const targets = ['DRAFT', 'ACTIVE', 'MATCHING', 'FULFILLED', 'EXPIRED', 'CANCELLED'] as const;
    for (const to of targets) {
      expect(canTransitionNeed('FULFILLED', to)).toBe(to === 'FULFILLED');
      expect(canTransitionNeed('CANCELLED', to)).toBe(to === 'CANCELLED');
    }
  });

  it('allows the normal lifecycle', () => {
    expect(canTransitionNeed('DRAFT', 'ACTIVE')).toBe(true);
    expect(canTransitionNeed('ACTIVE', 'MATCHING')).toBe(true);
    expect(canTransitionNeed('MATCHING', 'FULFILLED')).toBe(true);
  });

  it('allows cancelling from any non-terminal state', () => {
    expect(canTransitionNeed('DRAFT', 'CANCELLED')).toBe(true);
    expect(canTransitionNeed('ACTIVE', 'CANCELLED')).toBe(true);
    expect(canTransitionNeed('MATCHING', 'CANCELLED')).toBe(true);
  });

  it('allows re-activating an expired need', () => {
    expect(canTransitionNeed('EXPIRED', 'ACTIVE')).toBe(true);
  });
});
