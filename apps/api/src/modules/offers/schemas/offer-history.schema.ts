import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OfferHistoryDocument = HydratedDocument<OfferHistory>;

/**
 * Separate, append-only collection (per the spec's "all offer changes must
 * be stored as auditable records"). Never updated or deleted, only inserted.
 */
@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'offer_history' })
export class OfferHistory {
  @Prop({ type: Types.ObjectId, ref: 'Offer', required: true, index: true }) offerId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) actorId!: Types.ObjectId;
  @Prop({
    type: String,
    required: true,
    enum: ['SENT', 'VIEWED', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
  })
  action!: string;
  @Prop() price?: number;
  @Prop() message?: string;

  createdAt?: Date;
  _id!: Types.ObjectId;
}

export const OfferHistorySchema = SchemaFactory.createForClass(OfferHistory);
OfferHistorySchema.index({ offerId: 1, createdAt: 1 });
