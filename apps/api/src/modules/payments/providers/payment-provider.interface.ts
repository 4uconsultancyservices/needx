export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface CreateIntentInput {
  orderId: string;
  amount: number;
  currency: string;
}

export interface CreateIntentResult {
  providerRef: string;
  checkoutUrl?: string;
  clientSecret?: string;
}

export interface WebhookEvent {
  eventId: string;
  providerRef: string;
  status: 'SUCCEEDED' | 'FAILED';
  failureReason?: string;
}

export interface RefundResult {
  refundRef: string;
}

export interface PayoutResult {
  payoutRef: string;
}

/**
 * Everything order/rental logic needs from "a payment gateway", with zero
 * gateway-specific types leaking upward. To go live with Razorpay/Stripe:
 * implement this interface and swap the binding in payments.module.ts —
 * PaymentsService, OrdersService, and every controller are unaffected.
 */
export interface PaymentProvider {
  createIntent(input: CreateIntentInput): Promise<CreateIntentResult>;
  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean;
  parseWebhookEvent(rawBody: string): WebhookEvent;
  refund(providerRef: string, amount: number): Promise<RefundResult>;
  payout(destinationRef: string, amount: number): Promise<PayoutResult>;
}
