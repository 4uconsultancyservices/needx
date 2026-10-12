import { describe, expect, it } from 'vitest';
import { budgetSchema, dateRangeSchema } from '../common';
import { passwordSchema, registerSchema } from '../auth';
import { createNeedSchema } from '../need';
import { createOfferSchema } from '../offer';

describe('budgetSchema', () => {
  it('accepts a valid min/max budget', () => {
    expect(budgetSchema.safeParse({ min: 100, max: 500, currency: 'INR' }).success).toBe(true);
  });

  it('rejects min greater than max', () => {
    const result = budgetSchema.safeParse({ min: 500, max: 100, currency: 'INR' });
    expect(result.success).toBe(false);
  });

  it('defaults currency to INR when omitted', () => {
    const result = budgetSchema.safeParse({ max: 1000 });
    expect(result.success && result.data.currency).toBe('INR');
  });
});

describe('dateRangeSchema', () => {
  it('rejects an end date before the start date', () => {
    const result = dateRangeSchema.safeParse({
      start: '2026-06-10T00:00:00.000Z',
      end: '2026-06-01T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid ascending range', () => {
    const result = dateRangeSchema.safeParse({
      start: '2026-06-01T00:00:00.000Z',
      end: '2026-06-10T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });
});

describe('passwordSchema', () => {
  it('rejects a password with no digit', () => {
    expect(passwordSchema.safeParse('onlyletters').success).toBe(false);
  });

  it('rejects a password under 8 characters', () => {
    expect(passwordSchema.safeParse('ab1').success).toBe(false);
  });

  it('accepts a reasonable real-world password', () => {
    expect(passwordSchema.safeParse('correcthorse1').success).toBe(true);
  });
});

describe('registerSchema', () => {
  it('lowercases the email on parse', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'Test@Example.COM',
      password: 'password1',
    });
    expect(result.success && result.data.email).toBe('test@example.com');
  });
});

describe('createNeedSchema', () => {
  it('requires at least one transaction mode', () => {
    const result = createNeedSchema.safeParse({
      title: 'Need a drill',
      modes: [],
      location: { point: { type: 'Point', coordinates: [77.1, 28.5] }, label: 'Delhi' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts a minimal valid need', () => {
    const result = createNeedSchema.safeParse({
      title: 'Need a drill',
      modes: ['RENT'],
      location: { point: { type: 'Point', coordinates: [77.1, 28.5] }, label: 'Delhi' },
    });
    expect(result.success).toBe(true);
  });
});

describe('createOfferSchema', () => {
  it('rejects a negative price', () => {
    const result = createOfferSchema.safeParse({ needId: 'n1', mode: 'RENT', price: -50 });
    expect(result.success).toBe(false);
  });

  it('defaults expiresInHours to 72', () => {
    const result = createOfferSchema.safeParse({ needId: 'n1', mode: 'RENT', price: 500 });
    expect(result.success && result.data.expiresInHours).toBe(72);
  });
});
