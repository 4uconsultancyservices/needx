import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { OrderStatus, OrderType, TransactionMode } from '@needx/types';
import { AppException } from '../../common/errors/app.exception';
import { OffersService } from '../offers/offers.service';
import { ListingsService } from '../listings/listings.service';
import { NeedsService } from '../needs/needs.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Order, OrderDocument } from './schemas/order.schema';
import { canTransitionOrder } from './order-status.util';

const MODE_TO_ORDER_TYPE: Record<TransactionMode, OrderType> = {
  BUY: 'BUY',
  RENT: 'RENT',
  BORROW: 'BORROW',
  HIRE: 'SERVICE',
  EXCHANGE: 'BUY',
  DONATE: 'BUY',
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly offersService: OffersService,
    private readonly listingsService: ListingsService,
    private readonly needsService: NeedsService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createFromOffer(buyerId: string, offerId: string): Promise<OrderDocument> {
    const offer = await this.offersService.findByIdOrThrow(offerId);
    if (offer.status !== 'ACCEPTED') {
      throw AppException.invalidState('Only an accepted offer can become an order');
    }

    const existing = await this.orderModel.findOne({ offerId: offer.id }).exec();
    if (existing) return existing; // idempotent — re-posting the same accept doesn't duplicate the order

    const need = offer.needId ? await this.needsService.findByIdOrThrow(offer.needId.toString()) : undefined;
    if (need && need.userId.toString() !== buyerId) {
      throw AppException.forbidden('Only the need owner can create the order for this offer');
    }

    const order = await this.orderModel.create({
      needId: offer.needId,
      offerId: offer.id,
      listingId: offer.listingId,
      buyerId,
      providerId: offer.providerId,
      type: MODE_TO_ORDER_TYPE[offer.mode],
      status: 'PENDING',
      amount: offer.price,
      depositAmount: offer.deposit,
      deliveryFee: offer.deliveryFee,
      currency: offer.currency,
      quantity: need?.quantity ?? 1,
      statusHistory: [{ status: 'PENDING', at: new Date(), actorId: buyerId }],
    });

    return order;
  }

  async findByIdOrThrow(id: string): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(id)) throw AppException.notFound('Order');
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw AppException.notFound('Order');
    return order;
  }

  private assertParty(order: OrderDocument, actorId: string) {
    if (order.buyerId.toString() !== actorId && order.providerId.toString() !== actorId) {
      throw AppException.forbidden('You are not part of this order');
    }
  }

  /** The one guarded primitive every status change goes through — never
   * called directly from a controller with an arbitrary target status. */
  async transition(orderId: string, to: OrderStatus, actorId?: string, note?: string): Promise<OrderDocument> {
    const order = await this.findByIdOrThrow(orderId);
    if (!canTransitionOrder(order.status, to)) {
      throw AppException.invalidState(`Cannot move an order from ${order.status} to ${to}`);
    }
    order.status = to;
    order.statusHistory.push({ status: to, at: new Date(), actorId: actorId as unknown as Types.ObjectId, note });
    await order.save();

    await this.notificationsService.notify({
      userId: order.buyerId.toString(),
      type: 'ORDER_UPDATE',
      title: 'Order update',
      body: `Your order is now ${to.replace('_', ' ').toLowerCase()}.`,
      linkUrl: `/dashboard/orders`,
    });
    if (order.providerId.toString() !== order.buyerId.toString()) {
      await this.notificationsService.notify({
        userId: order.providerId.toString(),
        type: 'ORDER_UPDATE',
        title: 'Order update',
        body: `Order is now ${to.replace('_', ' ').toLowerCase()}.`,
        linkUrl: `/provider/orders`,
      });
    }
    return order;
  }

  /** Called internally by PaymentsService once a webhook confirms payment. */
  async markPaid(orderId: string): Promise<OrderDocument> {
    const order = await this.transition(orderId, 'PAID');
    if (order.listingId) {
      await this.listingsService.decrementQuantity(order.listingId.toString(), order.quantity).catch(() => undefined);
    }
    return order;
  }

  async confirm(orderId: string, actorId: string): Promise<OrderDocument> {
    const order = await this.findByIdOrThrow(orderId);
    if (order.providerId.toString() !== actorId) throw AppException.forbidden('Only the provider can confirm this order');
    return this.transition(orderId, 'CONFIRMED', actorId);
  }

  async markReady(orderId: string, actorId: string): Promise<OrderDocument> {
    const order = await this.findByIdOrThrow(orderId);
    if (order.providerId.toString() !== actorId) throw AppException.forbidden('Only the provider can mark this order ready');
    return this.transition(orderId, 'READY', actorId);
  }

  async start(orderId: string, actorId: string): Promise<OrderDocument> {
    const order = await this.findByIdOrThrow(orderId);
    this.assertParty(order, actorId);
    return this.transition(orderId, 'ACTIVE', actorId);
  }

  async complete(orderId: string, actorId: string): Promise<OrderDocument> {
    const order = await this.findByIdOrThrow(orderId);
    this.assertParty(order, actorId);
    const completed = await this.transition(orderId, 'COMPLETED', actorId);
    await Promise.all([
      this.usersService.incrementCompletedTransactions(order.buyerId.toString()),
      this.usersService.incrementCompletedTransactions(order.providerId.toString()),
      order.needId ? this.needsService.markFulfilled(order.needId.toString()) : Promise.resolve(),
    ]);
    return completed;
  }

  async cancel(orderId: string, actorId: string, reason?: string): Promise<OrderDocument> {
    const order = await this.findByIdOrThrow(orderId);
    this.assertParty(order, actorId);
    return this.transition(orderId, 'CANCELLED', actorId, reason);
  }

  async markDisputed(orderId: string, actorId?: string): Promise<OrderDocument> {
    return this.transition(orderId, 'DISPUTED', actorId);
  }

  async markRefunded(orderId: string, actorId?: string, note?: string): Promise<OrderDocument> {
    return this.transition(orderId, 'REFUNDED', actorId, note);
  }

  async listForBuyer(buyerId: string, page: number, limit: number, status?: string) {
    const filter: Record<string, unknown> = { buyerId };
    if (status) filter.status = status;
    return this.paginate(filter, page, limit);
  }

  async listForProvider(providerId: string, page: number, limit: number, status?: string) {
    const filter: Record<string, unknown> = { providerId };
    if (status) filter.status = status;
    return this.paginate(filter, page, limit);
  }

  async listForAdmin(page: number, limit: number, status?: string) {
    return this.paginate(status ? { status } : {}, page, limit);
  }

  private async paginate(filter: Record<string, unknown>, page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async gmvTotal(): Promise<number> {
    const result = await this.orderModel.aggregate([
      { $match: { status: { $in: ['PAID', 'CONFIRMED', 'READY', 'ACTIVE', 'COMPLETED'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async countByStatus(status: OrderStatus): Promise<number> {
    return this.orderModel.countDocuments({ status }).exec();
  }
}
