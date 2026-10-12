import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PushSubscriptionDocument = HydratedDocument<PushSubscription>;

@Schema({ _id: false })
class PushKeys {
  @Prop({ required: true }) p256dh!: string;
  @Prop({ required: true }) auth!: string;
}

@Schema({ timestamps: true, collection: 'push_subscriptions' })
export class PushSubscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) userId!: Types.ObjectId;
  @Prop({ required: true, unique: true }) endpoint!: string;
  @Prop({ type: PushKeys, required: true }) keys!: PushKeys;
  @Prop() userAgent?: string;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const PushSubscriptionSchema = SchemaFactory.createForClass(PushSubscription);
