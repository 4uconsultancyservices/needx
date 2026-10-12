import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './schemas/audit-log.schema';

export interface RecordAuditInput {
  actorId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

/**
 * Append-only trail for sensitive actions (login, role change, moderation,
 * payment events, admin actions...). Never update or delete entries here.
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger('AuditLog');

  constructor(@InjectModel(AuditLog.name) private readonly model: Model<AuditLog>) {}

  async record(input: RecordAuditInput): Promise<void> {
    try {
      await this.model.create(input);
    } catch (err) {
      // Audit logging must never break the primary request flow.
      this.logger.error(`Failed to record audit log for action=${input.action}: ${(err as Error).message}`);
    }
  }

  async list(page: number, limit: number, action?: string) {
    const filter = action ? { action } : {};
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }
}
