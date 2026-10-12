import type { BaseEntity } from './common';
import type { NotificationType } from './enums';

export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  linkUrl?: string;
  read: boolean;
  readAt?: string;
}

export interface PushSubscriptionRecord extends BaseEntity {
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
}
