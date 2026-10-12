import { canTransitionOffer } from './offer-status.util';

describe('canTransitionOffer', () => {
  it('a rejected offer can never be accepted (spec §67)', () => {
    expect(canTransitionOffer('REJECTED', 'ACCEPTED')).toBe(false);
  });

  it('an expired offer can never be accepted (spec §67)', () => {
    expect(canTransitionOffer('EXPIRED', 'ACCEPTED')).toBe(false);
  });

  it('REJECTED, EXPIRED, ACCEPTED, and CANCELLED are all terminal', () => {
    const terminal = ['REJECTED', 'EXPIRED', 'ACCEPTED', 'CANCELLED'] as const;
    const targets = ['SENT', 'VIEWED', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'] as const;
    for (const from of terminal) {
      for (const to of targets) {
        expect(canTransitionOffer(from, to)).toBe(false);
      }
    }
  });

  it('allows the negotiation happy path', () => {
    expect(canTransitionOffer('SENT', 'VIEWED')).toBe(true);
    expect(canTransitionOffer('VIEWED', 'COUNTERED')).toBe(true);
    expect(canTransitionOffer('COUNTERED', 'ACCEPTED')).toBe(true);
  });

  it('allows repeated back-and-forth countering', () => {
    expect(canTransitionOffer('COUNTERED', 'COUNTERED')).toBe(true);
  });

  it('allows a direct accept without going through VIEWED first', () => {
    expect(canTransitionOffer('SENT', 'ACCEPTED')).toBe(true);
  });
});
