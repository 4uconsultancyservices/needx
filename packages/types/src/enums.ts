// Central enums shared by the API and the web app. Keep these as the single
// source of truth — never re-declare the same string unions elsewhere.

export const ROLES = [
  'USER',
  'PROVIDER',
  'BUSINESS',
  'MODERATOR',
  'ADMIN',
  'SUPER_ADMIN',
] as const;
export type Role = (typeof ROLES)[number];

export const PROVIDER_TYPES = ['INDIVIDUAL', 'PROFESSIONAL', 'BUSINESS'] as const;
export type ProviderType = (typeof PROVIDER_TYPES)[number];

export const TRANSACTION_MODES = [
  'BUY',
  'RENT',
  'BORROW',
  'HIRE',
  'EXCHANGE',
  'DONATE',
] as const;
export type TransactionMode = (typeof TRANSACTION_MODES)[number];

export const NEED_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'MATCHING',
  'FULFILLED',
  'EXPIRED',
  'CANCELLED',
] as const;
export type NeedStatus = (typeof NEED_STATUSES)[number];

export const LISTING_TYPES = ['PRODUCT', 'SERVICE', 'RENTAL'] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const LISTING_STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'SOLD', 'ARCHIVED'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const PRICE_UNITS = ['ITEM', 'DAY', 'HOUR', 'SERVICE'] as const;
export type PriceUnit = (typeof PRICE_UNITS)[number];

export const OFFER_STATUSES = [
  'SENT',
  'VIEWED',
  'COUNTERED',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const ORDER_TYPES = ['BUY', 'RENT', 'BORROW', 'SERVICE'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const ORDER_STATUSES = [
  'PENDING',
  'PAYMENT_PENDING',
  'PAID',
  'CONFIRMED',
  'READY',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED',
  'REFUNDED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const LEDGER_ENTRY_TYPES = [
  'CUSTOMER_PAYMENT',
  'PLATFORM_FEE',
  'PROVIDER_PAYABLE',
  'REFUND',
  'DEPOSIT',
  'DEPOSIT_RELEASE',
  'PENALTY',
  'ADJUSTMENT',
  'PAYOUT',
] as const;
export type LedgerEntryType = (typeof LEDGER_ENTRY_TYPES)[number];

export const NOTIFICATION_TYPES = [
  'NEED_MATCH',
  'NEW_OFFER',
  'COUNTER_OFFER',
  'OFFER_ACCEPTED',
  'OFFER_REJECTED',
  'NEW_MESSAGE',
  'ORDER_UPDATE',
  'RENTAL_REMINDER',
  'RETURN_REMINDER',
  'PAYMENT_UPDATE',
  'REVIEW_RECEIVED',
  'SYSTEM',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const REPORT_TARGET_TYPES = ['USER', 'LISTING', 'NEED', 'MESSAGE', 'REVIEW'] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_REASONS = ['SPAM', 'FRAUD', 'PROHIBITED', 'FAKE', 'ABUSE', 'OTHER'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_STATUSES = [
  'OPEN',
  'REVIEWING',
  'RESOLVED',
  'REJECTED',
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const DISPUTE_STATUSES = [
  'OPEN',
  'REVIEWING',
  'RESOLVED_BUYER',
  'RESOLVED_PROVIDER',
  'RESOLVED_SPLIT',
  'CLOSED',
] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const CONVERSATION_CONTEXT_TYPES = ['NEED', 'OFFER', 'ORDER'] as const;
export type ConversationContextType = (typeof CONVERSATION_CONTEXT_TYPES)[number];

export const MESSAGE_KINDS = [
  'TEXT',
  'IMAGE',
  'FILE',
  'OFFER_CARD',
  'COUNTER_OFFER_CARD',
  'ORDER_CARD',
  'SYSTEM',
] as const;
export type MessageKind = (typeof MESSAGE_KINDS)[number];
