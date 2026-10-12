import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { CreateDisputeInput } from '@needx/validation';
import { AppException } from '../../common/errors/app.exception';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Dispute, DisputeDocument } from './schemas/dispute.schema';

@Injectable()
export class DisputesService {
  constructor(
    @InjectModel(Dispute.name) private readonly model: Model<Dispute>,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(raisedById: string, dto: CreateDisputeInput): Promise<DisputeDocument> {
    const order = await this.ordersService.findByIdOrThrow(dto.orderId);
    const buyerId = order.buyerId.toString();
    const providerId = order.providerId.toString();
    if (raisedById !== buyerId && raisedById !== providerId) {
      throw AppException.forbidden('You were not part of this order');
    }
    const existing = await this.model.findOne({ orderId: order.id }).exec();
    if (existing) throw AppException.conflict('A dispute already exists for this order');

    const dispute = await this.model.create({
      orderId: order.id,
      raisedById,
      againstId: raisedById === buyerId ? providerId : buyerId,
      reason: dto.reason,
      details: dto.details,
      evidenceUrls: dto.evidenceUrls,
      status: 'OPEN',
    });

    await this.ordersService.markDisputed(order.id, raisedById);
    await this.notificationsService.notify({
      userId: dispute.againstId.toString(),
      type: 'ORDER_UPDATE',
      title: 'A dispute was opened on your order',
      body: dto.reason,
      linkUrl: `/dashboard/orders`,
    });

    return dispute;
  }

  async findByIdOrThrow(id: string): Promise<DisputeDocument> {
    const dispute = await this.model.findById(id).exec();
    if (!dispute) throw AppException.notFound('Dispute');
    return dispute;
  }

  async resolve(
    disputeId: string,
    adminId: string,
    status: 'RESOLVED_BUYER' | 'RESOLVED_PROVIDER' | 'RESOLVED_SPLIT' | 'CLOSED',
    resolutionNote: string,
  ): Promise<DisputeDocument> {
    const dispute = await this.findByIdOrThrow(disputeId);
    if (dispute.status !== 'OPEN' && dispute.status !== 'REVIEWING') {
      throw AppException.invalidState('This dispute has already been resolved');
    }

    dispute.status = status;
    dispute.resolutionNote = resolutionNote;
    dispute.resolvedById = adminId as unknown as Dispute['resolvedById'];
    dispute.resolvedAt = new Date();
    await dispute.save();

    const orderId = dispute.orderId.toString();
    if (status === 'RESOLVED_BUYER') {
      await this.paymentsService.refundOrder(orderId, `Dispute resolved in buyer's favor: ${resolutionNote}`).catch(async () => {
        // No successful payment to refund (e.g. free/BORROW order) — just close it out.
        await this.ordersService.markRefunded(orderId, adminId, resolutionNote);
      });
    } else if (status === 'RESOLVED_PROVIDER' || status === 'RESOLVED_SPLIT') {
      await this.ordersService.transition(orderId, 'COMPLETED', adminId, `Dispute ${status}: ${resolutionNote}`);
    }
    // CLOSED: dispute is closed administratively with no order-state change.

    for (const userId of [dispute.raisedById.toString(), dispute.againstId.toString()]) {
      await this.notificationsService.notify({
        userId,
        type: 'ORDER_UPDATE',
        title: 'Dispute resolved',
        body: resolutionNote,
        linkUrl: `/dashboard/orders`,
      });
    }

    return dispute;
  }

  async listForAdmin(page: number, limit: number, status?: string) {
    const filter = status ? { status } : {};
    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async countOpen(): Promise<number> {
    return this.model.countDocuments({ status: { $in: ['OPEN', 'REVIEWING'] } }).exec();
  }
}
