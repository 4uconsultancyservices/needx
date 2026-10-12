import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ORDER_STATUSES, ORDER_TYPES, type OrderStatus, type OrderType } from '@needx/types';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
class OrderStatusHistoryEntry {
  @Prop({ type: String, enum: ORDER_STATUSES, required: true }) status!: OrderStatus;
  @Prop({ default: () => new Date() }) at!: Date;
  @Prop({ type: Types.ObjectId, ref: 'User' }) actorId?: Types.ObjectId;
  @Prop() note?: string;
}

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Need' }) needId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Offer', required: true, unique: true }) offerId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Listing' }) listingId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) buyerId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) providerId!: Types.ObjectId;

  @Prop({ type: String, enum: ORDER_TYPES, required: true }) type!: OrderType;
  @Prop({ type: String, enum: ORDER_STATUSES, default: 'PENDING', index: true }) status!: OrderStatus;

  @Prop({ required: true }) amount!: number;
  @Prop() depositAmount?: number;
  @Prop() deliveryFee?: number;
  @Prop({ default: 'INR' }) currency!: string;
  @Prop({ default: 1 }) quantity!: number;

  @Prop({ type: [OrderStatusHistoryEntry], default: [] }) statusHistory!: OrderStatusHistoryEntry[];

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ buyerId: 1, status: 1 });
OrderSchema.index({ providerId: 1, status: 1 });
