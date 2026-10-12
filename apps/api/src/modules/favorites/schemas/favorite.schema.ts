import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FavoriteDocument = HydratedDocument<Favorite>;
export type FavoriteTargetType = 'LISTING' | 'PROVIDER' | 'NEED';

@Schema({ timestamps: true, collection: 'favorites' })
export class Favorite {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) userId!: Types.ObjectId;
  @Prop({ type: String, enum: ['LISTING', 'PROVIDER', 'NEED'], required: true }) targetType!: FavoriteTargetType;
  @Prop({ required: true }) targetId!: string;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
FavoriteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
