import { MATCHING_WEIGHTS } from './matching.config';

describe('MATCHING_WEIGHTS', () => {
  it('sums to exactly 1 so the final score is a clean 0..100 scale', () => {
    const total = Object.values(MATCHING_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(Math.round(total * 1000) / 1000).toBe(1);
  });

  it('every weight is non-negative', () => {
    for (const weight of Object.values(MATCHING_WEIGHTS)) {
      expect(weight).toBeGreaterThanOrEqual(0);
    }
  });

  it('semantic relevance is weighted highest, per the product spec', () => {
    const max = Math.max(...Object.values(MATCHING_WEIGHTS));
    expect(MATCHING_WEIGHTS.semanticRelevance).toBe(max);
  });
});
