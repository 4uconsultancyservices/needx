import { Injectable } from '@nestjs/common';

const STOPWORDS = new Set([
  'a', 'an', 'the', 'for', 'in', 'of', 'to', 'and', 'with', 'is', 'i', 'need',
  'needed', 'looking', 'want', 'wanted', 'please', 'my', 'me', 'this', 'that',
  'some', 'any', 'on', 'at', 'by', 'or', 'be', 'am', 'are', 'it', 'can',
  'someone', 'something', 'from', 'near',
]);

const EMBEDDING_DIMS = 128;

/**
 * A dependency-free stand-in for a real embeddings API (no AI_API_KEY is
 * configured in this environment — see ENVIRONMENT.md). Uses the classic
 * "hashing trick" (feature hashing): every token deterministically maps to
 * a dimension via djb2, weighted by term frequency, then L2-normalized.
 * It captures real lexical overlap and is genuinely useful for ranking —
 * just without the semantic generalization a trained model would add.
 * `AiModule` is the seam: swap this for a call to an embeddings endpoint
 * once `AI_PROVIDER` is not "none", with zero changes to callers.
 */
@Injectable()
export class EmbeddingService {
  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s₹]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOPWORDS.has(t));
  }

  private hash(token: string): number {
    let h = 5381;
    for (let i = 0; i < token.length; i++) {
      h = (h * 33) ^ token.charCodeAt(i);
    }
    return Math.abs(h) % EMBEDDING_DIMS;
  }

  generateEmbedding(text: string): number[] {
    const vector = new Array<number>(EMBEDDING_DIMS).fill(0);
    for (const token of this.tokenize(text)) {
      vector[this.hash(token)] += 1;
    }
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => v / norm);
  }

  cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
    // Vectors are already L2-normalized, so the dot product IS the cosine similarity.
    return Math.max(0, Math.min(1, dot));
  }

  /** Convenience: similarity between two raw strings, 0..1. */
  textSimilarity(a: string, b: string): number {
    return this.cosineSimilarity(this.generateEmbedding(a), this.generateEmbedding(b));
  }
}
