import type { BaseEntity } from './common';

export interface AuditLog extends BaseEntity {
  actorId?: string;
  action: string; // e.g. "USER_LOGIN", "ROLE_CHANGE", "LISTING_MODERATED"
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}
