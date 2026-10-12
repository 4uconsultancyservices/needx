import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ _id: false })
class ReviewRatings {
  @Prop({ required: true, min: 1, max: 5 }) overall!: number;
  @Prop({ min: 1, max: 5 }) communication?: number;
  @Prop({ min: 1, max: 5 }) quality?: number;
  @Prop({ min: 1, max: 5 }) timeliness?: number;
  @Prop({ min: 1, max: 5 }) value?: number;
}

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true }) orderId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) reviewerId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) revieweeId!: Types.ObjectId;

  @Prop({ type: ReviewRatings, required: true }) ratings!: ReviewRatings;
  @Prop() comment?: string;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ orderId: 1, reviewerId: 1 }, { unique: true });
