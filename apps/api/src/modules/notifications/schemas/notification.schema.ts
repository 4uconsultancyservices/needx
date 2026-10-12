import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NOTIFICATION_TYPES, type NotificationType } from '@needx/types';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'notifications' })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) userId!: Types.ObjectId;
  @Prop({ type: String, enum: NOTIFICATION_TYPES, required: true }) type!: NotificationType;
  @Prop({ required: true }) title!: string;
  @Prop({ required: true }) body!: string;
  @Prop() linkUrl?: string;
  @Prop({ default: false, index: true }) read!: boolean;
  @Prop() readAt?: Date;

  createdAt?: Date;
  _id!: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
