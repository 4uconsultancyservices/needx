import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema({ _id: false })
class GeoPointSchema {
  @Prop({ type: String, enum: ['Point'], default: 'Point' }) type!: 'Point';
  @Prop({ type: [Number] }) coordinates!: [number, number];
}

@Schema({ timestamps: true, collection: 'addresses' })
export class Address {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) userId!: Types.ObjectId;
  @Prop({ required: true }) label!: string;
  @Prop({ required: true }) line1!: string;
  @Prop() line2?: string;
  @Prop({ required: true }) city!: string;
  @Prop({ required: true }) state!: string;
  @Prop({ required: true }) postalCode!: string;
  @Prop({ required: true, default: 'India' }) country!: string;
  @Prop({ type: GeoPointSchema, required: true }) location!: GeoPointSchema;
  @Prop({ default: false }) isDefault!: boolean;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
AddressSchema.index({ location: '2dsphere' });
