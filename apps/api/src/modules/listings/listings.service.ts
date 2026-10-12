import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { CreateListingInput, ListingSearchQuery, UpdateListingInput } from '@needx/validation';
import { AppException } from '../../common/errors/app.exception';
import { ModerationService } from '../ai/moderation.service';
import { ReportsService } from '../reports/reports.service';
import { Listing, ListingDocument } from './schemas/listing.schema';

@Injectable()
export class ListingsService {
  constructor(
    @InjectModel(Listing.name) private readonly listingModel: Model<Listing>,
    private readonly moderation: ModerationService,
    private readonly reportsService: ReportsService,
  ) {}

  async create(providerId: string, dto: CreateListingInput): Promise<ListingDocument> {
    const listing = await this.listingModel.create({ ...dto, providerId, status: 'ACTIVE' });

    const screen = this.moderation.screen(`${dto.title} ${dto.description}`);
    if (screen.flagged) {
      await this.reportsService.createSystemReport({
        targetType: 'LISTING',
        targetId: listing.id,
        reason: 'PROHIBITED',
        details: `Auto-flagged by keyword screen: ${screen.reasons.join(', ')}`,
      });
    }
    return listing;
  }

  async findByIdOrThrow(id: string): Promise<ListingDocument> {
    if (!Types.ObjectId.isValid(id)) throw AppException.notFound('Listing');
    const listing = await this.listingModel.findById(id).exec();
    if (!listing) throw AppException.notFound('Listing');
    return listing;
  }

  async incrementView(id: string): Promise<void> {
    await this.listingModel.updateOne({ _id: id }, { $inc: { viewCount: 1 } }).exec();
  }

  async listForProvider(providerId: string, page: number, limit: number, status?: string) {
    const filter: Record<string, unknown> = {
      providerId: Types.ObjectId.isValid(providerId) ? new Types.ObjectId(providerId) : providerId,
    };
    if (status) filter.status = status;
    const [items, total] = await Promise.all([
      this.listingModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.listingModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async search(query: ListingSearchQuery) {
    const filter: Record<string, unknown> = { status: 'ACTIVE' };
    if (query.providerId) {
      filter.providerId = Types.ObjectId.isValid(query.providerId)
        ? new Types.ObjectId(query.providerId)
        : query.providerId;
    }
    if (query.categoryId) {
      filter.categoryId = Types.ObjectId.isValid(query.categoryId)
        ? new Types.ObjectId(query.categoryId)
        : query.categoryId;
    }
    if (query.mode) filter.modes = query.mode;
    if (query.condition) filter.condition = query.condition;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter['price.amount'] = {
        ...(query.minPrice !== undefined ? { $gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { $lte: query.maxPrice } : {}),
      };
    }
    if (query.q) filter.$text = { $search: query.q };

    let mongoQuery = this.listingModel.find(filter);

    if (query.lat !== undefined && query.lng !== undefined) {
      mongoQuery = this.listingModel.find({
        ...filter,
        'location.point': {
          $near: {
            $geometry: { type: 'Point', coordinates: [query.lng, query.lat] },
            $maxDistance: (query.radiusKm ?? 25) * 1000,
          },
        },
      });
    } else if (query.sort === 'price_asc') {
      mongoQuery = mongoQuery.sort({ 'price.amount': 1 });
    } else if (query.sort === 'price_desc') {
      mongoQuery = mongoQuery.sort({ 'price.amount': -1 });
    } else if (query.q) {
      mongoQuery = mongoQuery.sort({ score: { $meta: 'textScore' } });
    } else {
      mongoQuery = mongoQuery.sort({ createdAt: -1 });
    }

    const [items, total] = await Promise.all([
      mongoQuery
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .exec(),
      this.listingModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async update(providerId: string, listingId: string, dto: UpdateListingInput, isAdmin = false): Promise<ListingDocument> {
    const listing = await this.findByIdOrThrow(listingId);
    if (!isAdmin && listing.providerId.toString() !== providerId) {
      throw AppException.forbidden('You can only edit your own listings');
    }
    Object.assign(listing, dto);
    await listing.save();
    return listing;
  }

  async setStatus(providerId: string, listingId: string, status: Listing['status'], isAdmin = false) {
    return this.update(providerId, listingId, { status }, isAdmin);
  }

  async decrementQuantity(listingId: string, amount = 1): Promise<void> {
    const listing = await this.findByIdOrThrow(listingId);
    listing.quantity = Math.max(0, listing.quantity - amount);
    if (listing.quantity === 0 && listing.type !== 'RENTAL') listing.status = 'SOLD';
    await listing.save();
  }

  async listByCategory(categorySlugToId: string, page: number, limit: number) {
    const filter = { categoryId: categorySlugToId, status: 'ACTIVE' };
    const [items, total] = await Promise.all([
      this.listingModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.listingModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async listForAdmin(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.listingModel.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.listingModel.countDocuments().exec(),
    ]);
    return { items, total };
  }

  async countActive(): Promise<number> {
    return this.listingModel.countDocuments({ status: 'ACTIVE' }).exec();
  }
}
