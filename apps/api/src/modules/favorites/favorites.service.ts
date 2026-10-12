import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument, FavoriteTargetType } from './schemas/favorite.schema';
import { ListingsService } from '../listings/listings.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name) private readonly model: Model<Favorite>,
    private readonly listingsService: ListingsService,
  ) {}

  async add(userId: string, targetType: FavoriteTargetType, targetId: string): Promise<FavoriteDocument> {
    const favorite = await this.model.findOneAndUpdate(
      { userId, targetType, targetId },
      { $setOnInsert: { userId, targetType, targetId } },
      { upsert: true, new: true },
    );
    if (targetType === 'LISTING') {
      await this.listingsService
        .findByIdOrThrow(targetId)
        .then(() => this.model.db.model('Listing').updateOne({ _id: targetId }, { $inc: { favoriteCount: 1 } }))
        .catch(() => undefined);
    }
    return favorite;
  }

  async remove(userId: string, targetType: FavoriteTargetType, targetId: string): Promise<void> {
    const res = await this.model.deleteOne({ userId, targetType, targetId }).exec();
    if (res.deletedCount > 0 && targetType === 'LISTING') {
      await this.model.db.model('Listing').updateOne({ _id: targetId }, { $inc: { favoriteCount: -1 } }).catch(() => undefined);
    }
  }

  async list(userId: string, targetType?: FavoriteTargetType): Promise<FavoriteDocument[]> {
    const filter: Record<string, unknown> = { userId };
    if (targetType) filter.targetType = targetType;
    return this.model.find(filter).sort({ createdAt: -1 }).exec();
  }

  async isFavorited(userId: string, targetType: FavoriteTargetType, targetId: string): Promise<boolean> {
    const count = await this.model.countDocuments({ userId, targetType, targetId }).exec();
    return count > 0;
  }
}
