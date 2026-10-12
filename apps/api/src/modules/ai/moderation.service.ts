import { Injectable } from '@nestjs/common';

export interface ModerationResult {
  flagged: boolean;
  reasons: string[];
}

/**
 * Deliberately narrow keyword screen for clearly prohibited marketplace
 * listings (weapons, narcotics, counterfeit goods, stolen property). This is
 * NOT a profanity filter and won't catch everything — it exists to make
 * Report/Dispute review effortful-content triage faster, not to replace
 * human moderators or a real trust & safety ML model. See AiModule docs.
 */
const PROHIBITED_TERMS: Array<{ term: RegExp; reason: string }> = [
  { term: /\b(firearm|gun|pistol|rifle|ammunition|ammo)\b/i, reason: 'Possible weapon listing' },
  { term: /\b(narcotic|cocaine|heroin|mdma|weed\s+for\s+sale)\b/i, reason: 'Possible controlled substance' },
  { term: /\bcounterfeit|fake\s+currency|replica\s+(watch|bag)\b/i, reason: 'Possible counterfeit goods' },
  { term: /\bstolen\b/i, reason: 'Possible stolen property' },
  { term: /\bexplosive|bomb\s+making\b/i, reason: 'Possible explosive material' },
];

@Injectable()
export class ModerationService {
  screen(text: string): ModerationResult {
    const reasons: string[] = [];
    for (const { term, reason } of PROHIBITED_TERMS) {
      if (term.test(text)) reasons.push(reason);
    }
    return { flagged: reasons.length > 0, reasons };
  }
}
