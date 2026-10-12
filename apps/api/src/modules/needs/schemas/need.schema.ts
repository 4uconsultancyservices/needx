import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NEED_STATUSES, TRANSACTION_MODES, type NeedStatus, type TransactionMode } from '@needx/types';

export type NeedDocument = HydratedDocument<Need>;

@Schema({ _id: false })
class BudgetSchema {
  @Prop() min?: number;
  @Prop() max?: number;
  @Prop({ default: 'INR' }) currency!: string;
}

@Schema({ _id: false })
class DateRangeSchema {
  @Prop() start?: Date;
  @Prop() end?: Date;
}

@Schema({ _id: false })
class GeoPointSchema {
  @Prop({ type: String, enum: ['Point'], default: 'Point' }) type!: 'Point';
  @Prop({ type: [Number], required: true }) coordinates!: [number, number];
}

@Schema({ _id: false })
class LocationInfoSchema {
  @Prop({ type: GeoPointSchema, required: true }) point!: GeoPointSchema;
  @Prop({ required: true }) label!: string;
  @Prop() city?: string;
  @Prop() state?: string;
}

@Schema({ timestamps: true, collection: 'needs' })
export class Need {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) userId!: Types.ObjectId;

  @Prop({ required: true, trim: true }) title!: string;
  @Prop({ default: '' }) description!: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', index: true }) categoryId?: Types.ObjectId;

  @Prop({ type: [String], enum: TRANSACTION_MODES, required: true }) modes!: TransactionMode[];

  @Prop({ type: BudgetSchema }) budget?: BudgetSchema;
  @Prop({ default: 1 }) quantity?: number;
  @Prop({ type: DateRangeSchema }) dateRange?: DateRangeSchema;

  @Prop({ type: LocationInfoSchema, required: true }) location!: LocationInfoSchema;

  @Prop({ type: Object, default: {} }) attributes!: Record<string, unknown>;

  @Prop({ type: String, enum: NEED_STATUSES, default: 'ACTIVE', index: true }) status!: NeedStatus;

  @Prop() rawInput?: string;
  @Prop({ type: String, enum: ['RULE_BASED', 'AI', 'MANUAL'], default: 'MANUAL' }) parseSource?: string;
  @Prop({ default: 0 }) matchCount?: number;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const NeedSchema = SchemaFactory.createForClass(Need);
NeedSchema.index({ 'location.point': '2dsphere' });
NeedSchema.index({ title: 'text', description: 'text' });
NeedSchema.index({ status: 1, categoryId: 1, createdAt: -1 });
