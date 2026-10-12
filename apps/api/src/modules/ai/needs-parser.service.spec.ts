import { NeedsParserService } from './needs-parser.service';
import { EmbeddingService } from './embedding.service';
import type { CategoriesService } from '../categories/categories.service';

function makeCategory(name: string, keywords: string[]) {
  return { id: `cat_${name.toLowerCase()}`, name, keywords, toJSON: () => ({}) } as any;
}

describe('NeedsParserService', () => {
  const categories = [
    makeCategory('Electronics', ['projector', 'camera', 'laptop', 'tv']),
    makeCategory('Tools & Equipment', ['drill', 'ladder', 'toolkit']),
  ];
  const categoriesService = {
    findAllForMatching: jest.fn().mockResolvedValue(categories),
  } as unknown as CategoriesService;

  const parser = new NeedsParserService(categoriesService, new EmbeddingService());

  it('extracts a budget ceiling from "under ₹3000"', async () => {
    const result = await parser.parse('I need a projector for 2 days in Gurgaon under ₹3000');
    expect(result.budget).toEqual({ max: 3000, currency: 'INR' });
  });

  it('extracts the mentioned city', async () => {
    const result = await parser.parse('I need a projector for 2 days in Gurgaon under ₹3000');
    expect(result.locationLabel).toBe('Gurgaon, Haryana');
  });

  it('infers RENT as a mode when a duration is present', async () => {
    const result = await parser.parse('I need a projector for 2 days in Gurgaon under ₹3000');
    expect(result.modes).toContain('RENT');
  });

  it('matches the category via seeded keywords', async () => {
    const result = await parser.parse('I need a projector for 2 days in Gurgaon under ₹3000');
    expect(result.categoryName).toBe('Electronics');
  });

  it('never reports full (1.0) confidence — it is always a heuristic parse', async () => {
    const result = await parser.parse('I need a projector for 2 days in Gurgaon under ₹3000');
    expect(result.confidence).toBeLessThan(1);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('detects BORROW mode from "lend me"', async () => {
    const result = await parser.parse('Can someone lend me a ladder for this weekend?');
    expect(result.modes).toContain('BORROW');
  });

  it('detects BUY mode from "want to buy"', async () => {
    const result = await parser.parse('I want to buy a laptop, budget around 40000');
    expect(result.modes).toContain('BUY');
  });

  it('still returns a usable result with no recognizable city/category/budget', async () => {
    const result = await parser.parse('need help with something urgent');
    expect(result.title.length).toBeGreaterThan(0);
    expect(result.modes.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('strips leading filler phrases from the generated title', async () => {
    const result = await parser.parse('I need a drill for tomorrow');
    expect(result.title.toLowerCase().startsWith('i need')).toBe(false);
  });
});
