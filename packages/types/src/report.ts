import type { BaseEntity } from './common';
import type { DisputeStatus, ReportReason, ReportStatus, ReportTargetType } from './enums';

export interface Report extends BaseEntity {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  resolvedById?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface Dispute extends BaseEntity {
  orderId: string;
  raisedById: string;
  againstId: string;
  reason: string;
  details: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolutionNote?: string;
  resolvedById?: string;
  resolvedAt?: string;
}
