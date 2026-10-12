import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { ListingMatch, MatchScoreBreakdown } from '@needx/types';
import { AppException } from '../../common/errors/app.exception';
import { EmbeddingService } from '../ai/embedding.service';
import { Need } from '../needs/schemas/need.schema';
import { Listing } from '../listings/schemas/listing.schema';
import { User } from '../users/schemas/user.schema';
import { MATCHING_CANDIDATE_LIMIT, MATCHING_MAX_DISTANCE_KM, MATCHING_WEIGHTS } from './matching.config';
import { distanceKm } from './geo.util';

@Injectable()
export class MatchingService {
  constructor(
    @InjectModel(Need.name) private readonly needModel: Model<Need>,
    @InjectModel(Listing.name) private readonly listingModel: Model<Listing>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async matchListingsForNeed(needId: string, limit = 20): Promise<ListingMatch[]> {
    if (!Types.ObjectId.isValid(needId)) throw AppException.notFound('Need');
    const need = await this.needModel.findById(needId).exec();
    if (!need) throw AppException.notFound('Need');

    const candidateFilter: Record<string, unknown> = {
      status: 'ACTIVE',
      modes: { $in: need.modes },
    };
    if (need.categoryId) candidateFilter.categoryId = need.categoryId;

    const candidates = await this.listingModel
      .find({
        ...candidateFilter,
        'location.point': {
          $near: {
            $geometry: need.location.point,
            $maxDistance: MATCHING_MAX_DISTANCE_KM * 1000,
          },
        },
      })
      .limit(MATCHING_CANDIDATE_LIMIT)
      .exec()
      .catch(() =>
        // Fallback if no listings fall within the geo radius filter (or the
        // 2dsphere index path errors on an unexpected shape) — widen to a
        // plain category/mode match so the marketplace still returns *something*.
        this.listingModel.find(candidateFilter).limit(MATCHING_CANDIDATE_LIMIT).exec(),
      );

    if (candidates.length === 0) return [];

    const providerIds = [...new Set(candidates.map((c) => c.providerId.toString()))];
    const providers = await this.userModel.find({ _id: { $in: providerIds } }).exec();
    const providerMap = new Map(providers.map((p) => [p.id, p]));

    const needText = `${need.title} ${need.description}`;
    const needEmbedding = this.embeddingService.generateEmbedding(needText);

    const scored: ListingMatch[] = candidates.map((listing) => {
      const provider = providerMap.get(listing.providerId.toString());
      const breakdown = this.scoreListing(need, listing, provider, needEmbedding);
      const score = Object.entries(breakdown).reduce(
        (sum, [key, value]) => sum + value * MATCHING_WEIGHTS[key as keyof MatchScoreBreakdown],
        0,
      );
      return {
        listingId: listing.id,
        providerId: listing.providerId.toString(),
        score: Math.round(score * 100),
        breakdown,
        distanceKm: Number(distanceKm(need.location.point.coordinates, listing.location.point.coordinates).toFixed(1)),
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async matchNeedsForListing(listingId: string, limit = 20): Promise<Array<{ needId: string; score: number }>> {
    const listing = await this.listingModel.findById(listingId).exec();
    if (!listing) throw AppException.notFound('Listing');

    const needs = await this.needModel
      .find({
        status: { $in: ['ACTIVE', 'MATCHING'] },
        modes: { $in: listing.modes },
        ...(listing.categoryId ? { categoryId: listing.categoryId } : {}),
      })
      .limit(200)
      .exec();

    const listingEmbedding = this.embeddingService.generateEmbedding(`${listing.title} ${listing.description}`);

    return needs
      .map((need) => {
        const relevance = this.embeddingService.cosineSimilarity(
          listingEmbedding,
          this.embeddingService.generateEmbedding(`${need.title} ${need.description}`),
        );
        const dKm = distanceKm(listing.location.point.coordinates, need.location.point.coordinates);
        const locationScore = clamp(1 - dKm / MATCHING_MAX_DISTANCE_KM, 0, 1);
        const score = relevance * 0.6 + locationScore * 0.4;
        return { needId: need.id, score: Math.round(score * 100) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private scoreListing(
    need: Need,
    listing: Listing,
    provider: User | undefined,
    needEmbedding: number[],
  ): MatchScoreBreakdown {
    const categoryMatch = need.categoryId && listing.categoryId && String(need.categoryId) === String(listing.categoryId) ? 1 : 0;
    const lexicalSim = this.embeddingService.cosineSimilarity(
      needEmbedding,
      this.embeddingService.generateEmbedding(`${listing.title} ${listing.description}`),
    );
    const semanticRelevance = clamp(categoryMatch * 0.5 + lexicalSim * 0.5, 0, 1);

    const dKm = distanceKm(need.location.point.coordinates, listing.location.point.coordinates);
    const location = clamp(1 - dKm / MATCHING_MAX_DISTANCE_KM, 0, 1);

    let price = 0.7;
    if (need.budget && (need.budget.max !== undefined || need.budget.min !== undefined)) {
      const amount = listing.price.amount;
      if (need.budget.max !== undefined && amount > need.budget.max) {
        price = clamp(1 - (amount - need.budget.max) / need.budget.max, 0, 1);
      } else {
        price = 1;
      }
    }

    const availability = listing.status === 'ACTIVE' && listing.quantity > 0 ? 1 : 0;

    const rating = provider && provider.trust.ratingCount > 0 ? clamp(provider.trust.ratingAverage / 5, 0, 1) : 0.6;
    const reliability = provider ? clamp(1 - provider.trust.cancellationRate, 0, 1) : 0.6;
    const responseRate = provider ? clamp(provider.trust.responseRate, 0, 1) : 0.6;

    return { semanticRelevance, location, price, availability, rating, reliability, responseRate };
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
