import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { REPORT_REASONS, REPORT_STATUSES, REPORT_TARGET_TYPES, type ReportReason, type ReportStatus, type ReportTargetType } from '@needx/types';

export type ReportDocument = HydratedDocument<Report>;

@Schema({ timestamps: true, collection: 'reports' })
export class Report {
  // Absent for system/auto-flagged reports (see ModerationService).
  @Prop({ type: Types.ObjectId, ref: 'User' }) reporterId?: Types.ObjectId;

  @Prop({ type: String, enum: REPORT_TARGET_TYPES, required: true }) targetType!: ReportTargetType;
  @Prop({ required: true, index: true }) targetId!: string;

  @Prop({ type: String, enum: REPORT_REASONS, required: true }) reason!: ReportReason;
  @Prop() details?: string;

  @Prop({ type: String, enum: REPORT_STATUSES, default: 'OPEN', index: true }) status!: ReportStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' }) resolvedById?: Types.ObjectId;
  @Prop() resolvedAt?: Date;
  @Prop() resolutionNote?: string;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
