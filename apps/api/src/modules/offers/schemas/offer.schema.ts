import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OFFER_STATUSES, TRANSACTION_MODES, type OfferStatus, type TransactionMode } from '@needx/types';

export type OfferDocument = HydratedDocument<Offer>;

@Schema({ timestamps: true, collection: 'offers' })
export class Offer {
  @Prop({ type: Types.ObjectId, ref: 'Need', required: true, index: true }) needId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) providerId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Listing' }) listingId?: Types.ObjectId;

  @Prop({ type: String, enum: TRANSACTION_MODES, required: true }) mode!: TransactionMode;
  @Prop({ required: true }) price!: number;
  @Prop() deposit?: number;
  @Prop() deliveryFee?: number;
  @Prop({ default: 'INR' }) currency!: string;
  @Prop() message?: string;
  @Prop() availability?: string;
  @Prop() expiresAt?: Date;

  @Prop({ type: String, enum: OFFER_STATUSES, default: 'SENT', index: true }) status!: OfferStatus;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
OfferSchema.index({ needId: 1, status: 1 });
OfferSchema.index({ providerId: 1, status: 1 });
