import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RentalDocument = HydratedDocument<Rental>;

@Schema({ timestamps: true, collection: 'rentals' })
export class Rental {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, unique: true, index: true }) orderId!: Types.ObjectId;

  @Prop({ required: true }) startDate!: Date;
  @Prop({ required: true }) endDate!: Date;
  @Prop() returnedAt?: Date;

  @Prop({ default: 0 }) deposit!: number;
  @Prop({ default: 0 }) lateFeePerDay?: number;
  @Prop({ default: 0 }) damageFee?: number;

  @Prop() inspectionNotes?: string;
  @Prop() inspectionPassed?: boolean;
  @Prop() depositReleasedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const RentalSchema = SchemaFactory.createForClass(Rental);
RentalSchema.index({ startDate: 1, endDate: 1 });
