import type { Budget, DateRange, BaseEntity, LocationInfo } from './common';
import type { NeedStatus, TransactionMode } from './enums';

export interface Need extends BaseEntity {
  userId: string;
  title: string;
  description: string;
  categoryId?: string;
  modes: TransactionMode[];
  budget?: Budget;
  quantity?: number;
  dateRange?: DateRange;
  location: LocationInfo;
  attributes: Record<string, unknown>;
  status: NeedStatus;
  /** Raw text the user originally typed, kept for transparency + re-parsing. */
  rawInput?: string;
  /** How the structured fields above were produced. */
  parseSource?: 'RULE_BASED' | 'AI' | 'MANUAL';
  matchCount?: number;
}

export interface ParsedNeedPreview {
  title: string;
  categoryId?: string;
  categoryName?: string;
  modes: TransactionMode[];
  budget?: Budget;
  quantity?: number;
  dateRange?: DateRange;
  locationLabel?: string;
  confidence: number; // 0..1, heuristic
  parseSource: 'RULE_BASED' | 'AI';
}
