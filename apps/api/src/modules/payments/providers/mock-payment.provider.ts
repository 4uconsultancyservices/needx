import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import type {
  CreateIntentInput,
  CreateIntentResult,
  PaymentProvider,
  PayoutResult,
  RefundResult,
  WebhookEvent,
} from './payment-provider.interface';

/**
 * Dev-mode payment provider. No PAYMENT_SECRET exists for a real gateway in
 * this environment (see ENVIRONMENT.md) — per the spec, that's never
 * invented. This is NOT a fake "always succeeds" stub: it stands up a real
 * checkout page (see apps/web /pay/mock/[ref]) where the "customer" clicks
 * Simulate Success/Failure, which POSTs to the SAME signed-webhook endpoint
 * a real gateway would call, exercising the entire signature-verification +
 * idempotency + ledger pipeline for real. Swap for RazorpayProvider /
 * StripeProvider by implementing PaymentProvider and changing one binding
 * in payments.module.ts.
 */
@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  constructor(private readonly config: ConfigService) {}

  private get secret(): string {
    return this.config.get<string>('payment.webhookSecret') ?? 'dev_mock_webhook_secret_change_me';
  }

  async createIntent(input: CreateIntentInput): Promise<CreateIntentResult> {
    const providerRef = `mock_${randomUUID()}`;
    const appUrl = this.config.get<string>('app.appUrl');
    return {
      providerRef,
      checkoutUrl: `${appUrl}/pay/mock/${providerRef}?orderId=${input.orderId}&amount=${input.amount}&currency=${input.currency}`,
    };
  }

  signPayload(payload: string): string {
    return createHmac('sha256', this.secret).update(payload).digest('hex');
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    const expected = Buffer.from(this.signPayload(rawBody));
    const actual = Buffer.from(signatureHeader || '');
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  parseWebhookEvent(rawBody: string): WebhookEvent {
    const parsed = JSON.parse(rawBody) as WebhookEvent;
    if (!parsed.eventId || !parsed.providerRef || !parsed.status) {
      throw new Error('Malformed mock webhook payload');
    }
    return parsed;
  }

  async refund(providerRef: string): Promise<RefundResult> {
    return { refundRef: `mock_refund_${providerRef}_${randomUUID().slice(0, 8)}` };
  }

  async payout(destinationRef: string): Promise<PayoutResult> {
    return { payoutRef: `mock_payout_${destinationRef}_${randomUUID().slice(0, 8)}` };
  }
}
