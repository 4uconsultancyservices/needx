import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { addHours } from 'date-fns';
import type { CreateOfferInput, CounterOfferInput } from '@needx/validation';
import { AppException } from '../../common/errors/app.exception';
import { NeedsService } from '../needs/needs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Offer, OfferDocument } from './schemas/offer.schema';
import { OfferHistory, OfferHistoryDocument } from './schemas/offer-history.schema';
import { canTransitionOffer } from './offer-status.util';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private readonly offerModel: Model<Offer>,
    @InjectModel(OfferHistory.name) private readonly historyModel: Model<OfferHistory>,
    private readonly needsService: NeedsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async addHistory(offerId: Types.ObjectId | string, actorId: string, action: string, extra?: { price?: number; message?: string }) {
    await this.historyModel.create({ offerId, actorId, action, ...extra });
  }

  /** Lazily sweeps an offer to EXPIRED if its deadline has passed — guarantees
   * "an expired offer cannot be accepted" holds even without a cron sweep. */
  private async applyExpiryIfNeeded(offer: OfferDocument): Promise<OfferDocument> {
    const nonTerminal: Offer['status'][] = ['SENT', 'VIEWED', 'COUNTERED'];
    if (nonTerminal.includes(offer.status) && offer.expiresAt && offer.expiresAt < new Date()) {
      offer.status = 'EXPIRED';
      await offer.save();
      await this.addHistory(offer.id, offer.providerId.toString(), 'EXPIRED');
    }
    return offer;
  }

  async create(providerId: string, dto: CreateOfferInput): Promise<OfferDocument> {
    const need = await this.needsService.findByIdOrThrow(dto.needId);
    if (need.userId.toString() === providerId) {
      throw AppException.forbidden('You cannot make an offer on your own need');
    }
    if (!['ACTIVE', 'MATCHING'].includes(need.status)) {
      throw AppException.invalidState('This need is no longer accepting offers');
    }

    const offer = await this.offerModel.create({
      needId: dto.needId,
      providerId,
      listingId: dto.listingId,
      mode: dto.mode,
      price: dto.price,
      deposit: dto.deposit,
      deliveryFee: dto.deliveryFee,
      currency: dto.currency,
      message: dto.message,
      availability: dto.availability,
      expiresAt: addHours(new Date(), dto.expiresInHours),
      status: 'SENT',
    });
    await this.addHistory(offer.id, providerId, 'SENT', { price: dto.price, message: dto.message });

    if (need.status === 'ACTIVE') {
      await this.needsService.update(need.userId.toString(), need.id, { status: 'MATCHING' }, true);
    }

    await this.notificationsService.notify({
      userId: need.userId.toString(),
      type: 'NEW_OFFER',
      title: 'New offer on your need',
      body: `You received an offer of ₹${dto.price} for "${need.title}"`,
      linkUrl: `/dashboard/needs/${need.id}`,
    });

    return offer;
  }

  async findByIdOrThrow(id: string): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) throw AppException.notFound('Offer');
    const offer = await this.offerModel.findById(id).exec();
    if (!offer) throw AppException.notFound('Offer');
    return this.applyExpiryIfNeeded(offer);
  }

  async getHistory(offerId: string): Promise<OfferHistoryDocument[]> {
    return this.historyModel.find({ offerId }).sort({ createdAt: 1 }).exec();
  }

  async markViewed(offerId: string, viewerId: string): Promise<OfferDocument> {
    const offer = await this.findByIdOrThrow(offerId);
    const need = await this.needsService.findByIdOrThrow(offer.needId.toString());
    if (need.userId.toString() !== viewerId) throw AppException.forbidden();
    if (offer.status === 'SENT' && canTransitionOffer('SENT', 'VIEWED')) {
      offer.status = 'VIEWED';
      await offer.save();
      await this.addHistory(offer.id, viewerId, 'VIEWED');
    }
    return offer;
  }

  private async assertParticipant(offer: OfferDocument, actorId: string): Promise<string> {
    const need = await this.needsService.findByIdOrThrow(offer.needId.toString());
    const needOwnerId = need.userId.toString();
    if (actorId !== needOwnerId && actorId !== offer.providerId.toString()) {
      throw AppException.forbidden('You are not part of this negotiation');
    }
    return needOwnerId;
  }

  async counter(offerId: string, actorId: string, dto: CounterOfferInput): Promise<OfferDocument> {
    const offer = await this.findByIdOrThrow(offerId);
    await this.assertParticipant(offer, actorId);
    if (!canTransitionOffer(offer.status, 'COUNTERED')) {
      throw AppException.invalidState(`Cannot counter an offer in status ${offer.status}`);
    }
    offer.price = dto.price;
    if (dto.message) offer.message = dto.message;
    offer.status = 'COUNTERED';
    offer.expiresAt = addHours(new Date(), 72);
    await offer.save();
    await this.addHistory(offer.id, actorId, 'COUNTERED', { price: dto.price, message: dto.message });

    const need = await this.needsService.findByIdOrThrow(offer.needId.toString());
    const notifyUserId = actorId === need.userId.toString() ? offer.providerId.toString() : need.userId.toString();
    await this.notificationsService.notify({
      userId: notifyUserId,
      type: 'COUNTER_OFFER',
      title: 'Counter-offer received',
      body: `New counter-offer: ₹${dto.price} for "${need.title}"`,
      linkUrl: `/dashboard/needs/${need.id}`,
    });

    return offer;
  }

  async accept(offerId: string, actorId: string): Promise<OfferDocument> {
    const offer = await this.findByIdOrThrow(offerId);
    const needOwnerId = await this.assertParticipant(offer, actorId);
    if (actorId !== needOwnerId) {
      throw AppException.forbidden('Only the need owner can accept an offer');
    }
    if (!canTransitionOffer(offer.status, 'ACCEPTED')) {
      throw AppException.invalidState(`Cannot accept an offer in status ${offer.status}`);
    }
    offer.status = 'ACCEPTED';
    await offer.save();
    await this.addHistory(offer.id, actorId, 'ACCEPTED');

    await this.notificationsService.notify({
      userId: offer.providerId.toString(),
      type: 'OFFER_ACCEPTED',
      title: 'Your offer was accepted!',
      body: `Your offer of ₹${offer.price} was accepted. Time to arrange the order.`,
      linkUrl: `/provider/offers`,
    });

    return offer;
  }

  async reject(offerId: string, actorId: string, message?: string): Promise<OfferDocument> {
    const offer = await this.findByIdOrThrow(offerId);
    const needOwnerId = await this.assertParticipant(offer, actorId);
    if (actorId !== needOwnerId) {
      throw AppException.forbidden('Only the need owner can reject an offer');
    }
    if (!canTransitionOffer(offer.status, 'REJECTED')) {
      throw AppException.invalidState(`Cannot reject an offer in status ${offer.status}`);
    }
    offer.status = 'REJECTED';
    await offer.save();
    await this.addHistory(offer.id, actorId, 'REJECTED', { message });

    await this.notificationsService.notify({
      userId: offer.providerId.toString(),
      type: 'OFFER_REJECTED',
      title: 'Offer declined',
      body: message ?? 'Your offer was declined.',
    });
    return offer;
  }

  async cancel(offerId: string, actorId: string): Promise<OfferDocument> {
    const offer = await this.findByIdOrThrow(offerId);
    if (offer.providerId.toString() !== actorId) {
      throw AppException.forbidden('Only the offering provider can withdraw an offer');
    }
    if (!canTransitionOffer(offer.status, 'CANCELLED')) {
      throw AppException.invalidState(`Cannot withdraw an offer in status ${offer.status}`);
    }
    offer.status = 'CANCELLED';
    await offer.save();
    await this.addHistory(offer.id, actorId, 'CANCELLED');
    return offer;
  }

  async listForNeed(needId: string): Promise<OfferDocument[]> {
    const offers = await this.offerModel.find({ needId }).sort({ createdAt: -1 }).exec();
    return Promise.all(offers.map((o) => this.applyExpiryIfNeeded(o)));
  }

  async listForProvider(providerId: string, page: number, limit: number, status?: string) {
    const filter: Record<string, unknown> = { providerId };
    if (status) filter.status = status;
    const [items, total] = await Promise.all([
      this.offerModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.offerModel.countDocuments(filter).exec(),
    ]);
    return { items: await Promise.all(items.map((o) => this.applyExpiryIfNeeded(o))), total };
  }
}
