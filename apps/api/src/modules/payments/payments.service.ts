import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppException } from '../../common/errors/app.exception';
import { OrdersService } from '../orders/orders.service';
import { LedgerService } from '../ledger/ledger.service';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { PAYMENT_PROVIDER, type PaymentProvider } from './providers/payment-provider.interface';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('PaymentsService');

  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
    private readonly ordersService: OrdersService,
    private readonly ledgerService: LedgerService,
  ) {}

  async createCheckout(userId: string, orderId: string): Promise<{ checkoutUrl?: string; clientSecret?: string; paymentId: string }> {
    const order = await this.ordersService.findByIdOrThrow(orderId);
    if (order.buyerId.toString() !== userId) throw AppException.forbidden('Only the buyer can pay for this order');
    if (!['PENDING', 'PAYMENT_PENDING'].includes(order.status)) {
      throw AppException.invalidState(`Order in status ${order.status} cannot be paid for`);
    }

    // Deterministic idempotency key: re-clicking "pay" never creates a second
    // payment intent for the same order.
    const idempotencyKey = `order:${order.id}`;
    const existing = await this.paymentModel.findOne({ idempotencyKey }).exec();
    if (existing && existing.status === 'SUCCEEDED') {
      throw AppException.conflict('This order has already been paid');
    }
    if (existing && existing.status === 'PENDING') {
      return { paymentId: existing.id, checkoutUrl: this.rebuildCheckoutUrl(existing) };
    }

    const amount = order.amount + (order.depositAmount ?? 0) + (order.deliveryFee ?? 0);
    const intent = await this.provider.createIntent({ orderId: order.id, amount, currency: order.currency });

    const payment = await this.paymentModel.create({
      orderId: order.id,
      userId,
      provider: 'mock',
      providerRef: intent.providerRef,
      amount,
      currency: order.currency,
      status: 'PENDING',
      idempotencyKey,
    });

    if (order.status === 'PENDING') {
      await this.ordersService.transition(order.id, 'PAYMENT_PENDING', userId);
    }

    return { paymentId: payment.id, checkoutUrl: intent.checkoutUrl, clientSecret: intent.clientSecret };
  }

  private rebuildCheckoutUrl(payment: PaymentDocument): string {
    return `/pay/mock/${payment.providerRef}?orderId=${payment.orderId}&amount=${payment.amount}&currency=${payment.currency}`;
  }

  async handleWebhook(rawBody: string, signatureHeader: string): Promise<{ received: true }> {
    if (!this.provider.verifyWebhookSignature(rawBody, signatureHeader)) {
      throw AppException.forbidden('Invalid webhook signature', 'INVALID_SIGNATURE');
    }
    const event = this.provider.parseWebhookEvent(rawBody);

    const payment = await this.paymentModel.findOne({ providerRef: event.providerRef }).exec();
    if (!payment) {
      this.logger.warn(`Webhook for unknown providerRef=${event.providerRef}`);
      return { received: true };
    }

    // Idempotency: a duplicated webhook delivery for an already-processed
    // event must never create a second set of ledger entries.
    if (payment.processedEventIds.includes(event.eventId)) {
      return { received: true };
    }

    if (event.status === 'SUCCEEDED') {
      payment.status = 'SUCCEEDED';
      payment.processedEventIds.push(event.eventId);
      await payment.save();

      const order = await this.ordersService.markPaid(payment.orderId.toString());
      await this.ledgerService.recordPaymentSuccess({
        orderId: order.id,
        paymentId: payment.id,
        buyerId: order.buyerId.toString(),
        providerId: order.providerId.toString(),
        amount: order.amount,
        depositAmount: order.depositAmount,
        currency: order.currency,
      });
    } else {
      payment.status = 'FAILED';
      payment.failureReason = event.failureReason ?? 'Payment failed';
      payment.processedEventIds.push(event.eventId);
      await payment.save();
    }

    return { received: true };
  }

  async refundOrder(orderId: string, reason: string): Promise<void> {
    const payment = await this.paymentModel.findOne({ orderId, status: 'SUCCEEDED' }).exec();
    if (!payment) throw AppException.notFound('Successful payment for this order');

    await this.provider.refund(payment.providerRef, payment.amount);
    payment.status = 'REFUNDED';
    await payment.save();

    const order = await this.ordersService.markRefunded(orderId, undefined, reason);
    await this.ledgerService.recordRefund({
      orderId,
      userId: order.buyerId.toString(),
      amount: payment.amount,
      currency: payment.currency,
      reason,
    });
  }

  async listForOrder(orderId: string): Promise<PaymentDocument[]> {
    return this.paymentModel.find({ orderId }).sort({ createdAt: -1 }).exec();
  }
}
