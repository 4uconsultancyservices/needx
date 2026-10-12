import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DISPUTE_STATUSES, type DisputeStatus } from '@needx/types';

export type DisputeDocument = HydratedDocument<Dispute>;

@Schema({ timestamps: true, collection: 'disputes' })
export class Dispute {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, unique: true, index: true }) orderId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) raisedById!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) againstId!: Types.ObjectId;

  @Prop({ required: true }) reason!: string;
  @Prop({ required: true }) details!: string;
  @Prop({ type: [String], default: [] }) evidenceUrls!: string[];

  @Prop({ type: String, enum: DISPUTE_STATUSES, default: 'OPEN', index: true }) status!: DisputeStatus;
  @Prop() resolutionNote?: string;
  @Prop({ type: Types.ObjectId, ref: 'User' }) resolvedById?: Types.ObjectId;
  @Prop() resolvedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);
