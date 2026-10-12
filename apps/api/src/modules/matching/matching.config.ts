import type { MatchScoreBreakdown } from '@needx/types';

/**
 * Single source of truth for match-score weighting — nowhere else in the
 * codebase hardcodes these numbers. Must sum to 1; verified by a unit test.
 * Tune via env/DB later without touching MatchingService's scoring logic.
 */
export const MATCHING_WEIGHTS: MatchScoreBreakdown = {
  semanticRelevance: 0.3,
  location: 0.2,
  price: 0.15,
  availability: 0.1,
  rating: 0.1,
  reliability: 0.1,
  responseRate: 0.05,
};

export const MATCHING_MAX_DISTANCE_KM = 50;
export const MATCHING_CANDIDATE_LIMIT = 150;
