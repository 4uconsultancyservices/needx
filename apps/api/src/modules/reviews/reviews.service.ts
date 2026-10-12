import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { CreateReviewInput } from '@needx/validation';
import { AppException } from '../../common/errors/app.exception';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(reviewerId: string, dto: CreateReviewInput): Promise<ReviewDocument> {
    const order = await this.ordersService.findByIdOrThrow(dto.orderId);

    if (order.status !== 'COMPLETED') {
      throw AppException.invalidState('You can only review a completed order');
    }
    const buyerId = order.buyerId.toString();
    const providerId = order.providerId.toString();
    if (reviewerId !== buyerId && reviewerId !== providerId) {
      throw AppException.forbidden('You were not part of this order');
    }
    const revieweeId = reviewerId === buyerId ? providerId : buyerId;

    const existing = await this.reviewModel.findOne({ orderId: order.id, reviewerId }).exec();
    if (existing) throw AppException.conflict('You already reviewed this order', 'ALREADY_REVIEWED');

    const review = await this.reviewModel.create({
      orderId: order.id,
      reviewerId,
      revieweeId,
      ratings: dto.ratings,
      comment: dto.comment,
    });

    await this.recomputeRating(revieweeId);

    await this.notificationsService.notify({
      userId: revieweeId,
      type: 'REVIEW_RECEIVED',
      title: 'You received a review',
      body: `${dto.ratings.overall}★ — ${dto.comment ? dto.comment.slice(0, 80) : 'no comment left'}`,
    });

    return review;
  }

  private async recomputeRating(userId: string): Promise<void> {
    const stats = await this.reviewModel.aggregate([
      { $match: { revieweeId: userId as unknown as object } },
      { $group: { _id: null, avg: { $avg: '$ratings.overall' }, count: { $sum: 1 } } },
    ]);
    const avg = stats[0]?.avg ?? 0;
    const count = stats[0]?.count ?? 0;
    await this.usersService.recomputeRating(userId, Math.round(avg * 10) / 10, count);
  }

  async listForUser(revieweeId: string, page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.reviewModel.find({ revieweeId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.reviewModel.countDocuments({ revieweeId }).exec(),
    ]);
    return { items, total };
  }

  async listForOrder(orderId: string): Promise<ReviewDocument[]> {
    return this.reviewModel.find({ orderId }).exec();
  }
}
