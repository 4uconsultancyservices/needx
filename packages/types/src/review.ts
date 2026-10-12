import type { BaseEntity } from './common';

export interface ReviewRatings {
  overall: number; // 1..5
  communication?: number;
  quality?: number;
  timeliness?: number;
  value?: number;
}

export interface Review extends BaseEntity {
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  ratings: ReviewRatings;
  comment?: string;
}
