import { EmbeddingService } from './embedding.service';

describe('EmbeddingService', () => {
  const service = new EmbeddingService();

  it('produces an L2-normalized vector (magnitude ~1)', () => {
    const vec = service.generateEmbedding('need a projector for the weekend');
    const magnitude = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    expect(magnitude).toBeCloseTo(1, 5);
  });

  it('gives identical text a similarity of ~1', () => {
    expect(service.textSimilarity('need a camera', 'need a camera')).toBeCloseTo(1, 5);
  });

  it('gives unrelated text a low similarity', () => {
    const sim = service.textSimilarity('need a projector for a wedding', 'looking for a yoga instructor');
    expect(sim).toBeLessThan(0.4);
  });

  it('gives overlapping-topic text a higher similarity than unrelated text', () => {
    const related = service.textSimilarity('need a DSLR camera for a wedding shoot', 'professional camera available for wedding photography');
    const unrelated = service.textSimilarity('need a DSLR camera for a wedding shoot', 'need a plumber to fix a leaking tap');
    expect(related).toBeGreaterThan(unrelated);
  });

  it('ignores stopwords so filler words do not dominate the vector', () => {
    const tokens = service.tokenize('I need a camera for the weekend please');
    expect(tokens).not.toContain('i');
    expect(tokens).not.toContain('need');
    expect(tokens).not.toContain('for');
    expect(tokens).toContain('camera');
    expect(tokens).toContain('weekend');
  });
});
