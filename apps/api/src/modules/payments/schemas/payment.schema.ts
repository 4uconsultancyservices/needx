import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PAYMENT_STATUSES, type PaymentStatus } from '@needx/types';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true }) orderId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) userId!: Types.ObjectId;

  @Prop({ required: true }) provider!: string;
  @Prop({ required: true, unique: true }) providerRef!: string;

  @Prop({ required: true }) amount!: number;
  @Prop({ default: 'INR' }) currency!: string;
  @Prop({ type: String, enum: PAYMENT_STATUSES, default: 'PENDING', index: true }) status!: PaymentStatus;

  @Prop({ required: true, unique: true }) idempotencyKey!: string;
  @Prop() failureReason?: string;

  // Webhook event ids already processed for this payment — guarantees a
  // duplicated webhook delivery never creates duplicate ledger entries.
  @Prop({ type: [String], default: [] }) processedEventIds!: string[];

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
