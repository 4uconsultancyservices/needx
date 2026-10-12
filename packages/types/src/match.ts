export interface MatchScoreBreakdown {
  semanticRelevance: number;
  location: number;
  price: number;
  availability: number;
  rating: number;
  reliability: number;
  responseRate: number;
}

export interface ListingMatch {
  listingId: string;
  providerId: string;
  score: number; // 0..100
  breakdown: MatchScoreBreakdown;
  distanceKm?: number;
}
