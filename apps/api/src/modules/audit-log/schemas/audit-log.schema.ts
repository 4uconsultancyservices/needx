import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true }) actorId?: Types.ObjectId;
  @Prop({ required: true, index: true }) action!: string;
  @Prop() targetType?: string;
  @Prop() targetId?: string;
  @Prop({ type: Object }) metadata?: Record<string, unknown>;
  @Prop() ip?: string;

  createdAt?: Date;
  _id!: Types.ObjectId;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ createdAt: -1 });
