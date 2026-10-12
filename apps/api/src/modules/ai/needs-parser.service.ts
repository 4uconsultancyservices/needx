import { Injectable } from '@nestjs/common';
import type { Budget, DateRange, ParsedNeedPreview, TransactionMode } from '@needx/types';
import { TRANSACTION_MODES } from '@needx/types';
import { CategoriesService } from '../categories/categories.service';
import type { CategoryDocument } from '../categories/schemas/category.schema';
import { EmbeddingService } from './embedding.service';
import { findCityInText } from './cities.data';

const MODE_KEYWORDS: Record<TransactionMode, string[]> = {
  RENT: ['rent', 'rental', 'renting', 'for a day', 'for the weekend', 'per day', 'hire out'],
  BUY: ['buy', 'buying', 'purchase', 'want to own', 'to own'],
  BORROW: ['borrow', 'borrowing', 'lend', 'lend me', 'can someone lend'],
  HIRE: ['hire', 'need someone to', 'service', 'help with', 'technician', 'plumber', 'electrician', 'photographer', 'tutor', 'driver', 'cleaner'],
  EXCHANGE: ['exchange', 'swap', 'trade', 'barter'],
  DONATE: ['donate', 'donation', 'giving away', 'free to a good home'],
};

const LEADING_FILLER = /^(i\s+need|need|looking\s+for|want|require|searching\s+for)\s+(a|an|some)?\s*/i;

@Injectable()
export class NeedsParserService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async parse(rawText: string): Promise<ParsedNeedPreview> {
    const text = rawText.trim();
    const lower = text.toLowerCase();
    let confidence = 0.35; // heuristic parser starts modest, never claims certainty

    // ---- Budget ----
    let budget: Budget | undefined;
    const under = /(?:under|below|less\s+than|within|budget\s+of|budget\s+is|upto|up\s+to)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i.exec(text);
    const over = /(?:above|over|more\s+than|at\s+least)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i.exec(text);
    const bare = /₹\s?([\d,]+)/.exec(text) ?? /(?:rs\.?|inr)\s?([\d,]+)/i.exec(text);
    if (under) {
      budget = { max: toNumber(under[1]), currency: 'INR' };
      confidence += 0.2;
    } else if (over) {
      budget = { min: toNumber(over[1]), currency: 'INR' };
      confidence += 0.2;
    } else if (bare) {
      budget = { max: toNumber(bare[1]), currency: 'INR' };
      confidence += 0.15;
    }

    // ---- Duration / date range ----
    let dateRange: DateRange | undefined;
    const duration = /(\d+)\s*(day|days|hour|hours|week|weeks|month|months)/i.exec(text);
    if (duration) {
      const amount = Number(duration[1]);
      const unit = duration[2].toLowerCase();
      const days = unit.startsWith('hour') ? Math.max(1, Math.ceil(amount / 24)) : unit.startsWith('week') ? amount * 7 : unit.startsWith('month') ? amount * 30 : amount;
      const start = new Date();
      const end = new Date(start.getTime() + days * 86_400_000);
      dateRange = { start: start.toISOString(), end: end.toISOString() };
      confidence += 0.1;
    }

    // ---- Quantity ----
    let quantity = 1;
    const qty = /(\d+)\s*(pieces|units|nos|qty|x)\b/i.exec(text);
    if (qty) quantity = Math.max(1, Number(qty[1]));

    // ---- Location ----
    const city = findCityInText(text);
    const locationLabel = city ? `${city.name}, ${city.state}` : undefined;
    if (city) confidence += 0.2;

    // ---- Transaction mode(s) ----
    const modeScores = new Map<TransactionMode, number>();
    for (const mode of TRANSACTION_MODES) {
      const hits = MODE_KEYWORDS[mode].filter((kw) => lower.includes(kw)).length;
      if (hits > 0) modeScores.set(mode, hits);
    }
    if (duration && !modeScores.has('RENT')) modeScores.set('RENT', 0.5);
    let modes: TransactionMode[] = [...modeScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([m]) => m);
    if (modes.length === 0) modes = ['BUY', 'RENT'];
    else confidence += 0.1;

    // ---- Category (keyword overlap against seeded category.keywords) ----
    const categories = await this.categoriesService.findAllForMatching();
    const bestCategory = this.classifyCategory(text, categories);
    if (bestCategory) confidence += 0.15;

    // ---- Title ----
    let title = text.replace(LEADING_FILLER, '');
    title = title.replace(/\bunder\s*(?:₹|rs\.?|inr)?\s*[\d,]+\b/i, '').trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);
    if (title.length > 90) title = `${title.slice(0, 87)}...`;
    if (!title) title = text.slice(0, 90);

    return {
      title,
      categoryId: bestCategory?.id,
      categoryName: bestCategory?.name,
      modes,
      budget,
      quantity,
      dateRange,
      locationLabel,
      confidence: Math.min(0.95, Number(confidence.toFixed(2))),
      parseSource: 'RULE_BASED',
    };
  }

  classifyCategory(text: string, categories: CategoryDocument[]): CategoryDocument | undefined {
    const tokens = new Set(this.embeddingService.tokenize(text));
    let best: { category: CategoryDocument; score: number } | undefined;

    for (const category of categories) {
      const haystack = [category.name, ...category.keywords].map((s) => s.toLowerCase());
      let score = 0;
      for (const term of haystack) {
        if (term.includes(' ') ? text.toLowerCase().includes(term) : tokens.has(term)) {
          score += 1;
        }
      }
      if (score > 0 && (!best || score > best.score)) best = { category, score };
    }
    return best?.category;
  }
}

function toNumber(raw: string): number {
  return Number(raw.replace(/,/g, ''));
}
