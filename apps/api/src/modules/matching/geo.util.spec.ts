import { distanceKm } from './geo.util';

describe('distanceKm', () => {
  it('returns 0 for identical points', () => {
    const point: [number, number] = [77.209, 28.6139];
    expect(distanceKm(point, point)).toBeCloseTo(0, 5);
  });

  it('computes a realistic Delhi -> Gurgaon distance (~25-32km)', () => {
    const delhi: [number, number] = [77.209, 28.6139];
    const gurgaon: [number, number] = [77.0266, 28.4595];
    const d = distanceKm(delhi, gurgaon);
    expect(d).toBeGreaterThan(20);
    expect(d).toBeLessThan(35);
  });

  it('is symmetric', () => {
    const a: [number, number] = [72.8777, 19.076];
    const b: [number, number] = [73.8567, 18.5204];
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 8);
  });
});
