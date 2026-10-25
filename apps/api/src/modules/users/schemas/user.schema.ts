import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PROVIDER_TYPES, ROLES, type ProviderType, type Role } from '@needx/types';
import {
  CustomerPreferencesSchema,
  BuyerMetricsSchema,
  CustomerKycSchema,
  CustomerLoyaltySchema,
} from './customer-profile.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
class TrustInfo {
  @Prop({ default: false }) phoneVerified!: boolean;
  @Prop({ default: false }) emailVerified!: boolean;
  @Prop({ default: false }) identityVerified!: boolean;
  @Prop({ default: false }) businessVerified!: boolean;
  @Prop({ default: 0 }) completedTransactions!: number;
  @Prop({ default: 0 }) ratingAverage!: number;
  @Prop({ default: 0 }) ratingCount!: number;
  @Prop({ default: 0 }) cancellationRate!: number;
  @Prop({ default: 1 }) responseRate!: number;
  @Prop() avgResponseMinutes?: number;
}

@Schema({ _id: false })
class ProviderProfile {
  @Prop({ default: false }) isProvider!: boolean;
  @Prop({ type: String, enum: PROVIDER_TYPES }) providerType?: ProviderType;
  @Prop() businessName?: string;
  @Prop() description?: string;
  @Prop({ type: [String], default: [] }) serviceCategories!: string[];
}

@Schema({ _id: false })
class GeoPointSchema {
  @Prop({ type: String, enum: ['Point'], default: 'Point' }) type!: 'Point';
  @Prop({ type: [Number] }) coordinates!: [number, number];
}

@Schema({ timestamps: true, collection: 'customers' })
export class User {
  @Prop({ required: true, trim: true }) name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true, select: false }) passwordHash!: string;

  @Prop({ unique: true, sparse: true }) phone?: string;

  @Prop({ type: [String], enum: ROLES, default: ['USER'] }) roles!: Role[];

  @Prop() avatarUrl?: string;
  @Prop() bio?: string;
  @Prop() city?: string;

  @Prop({ type: ProviderProfile, default: () => ({}) }) provider!: ProviderProfile;
  @Prop({ type: TrustInfo, default: () => ({}) }) trust!: TrustInfo;

  @Prop({ type: GeoPointSchema }) approxLocation?: GeoPointSchema;

  @Prop({ default: false, select: false }) emailVerifiedFlag?: boolean;
  @Prop({ select: false }) emailVerificationTokenHash?: string;
  @Prop({ select: false }) emailVerificationExpiresAt?: Date;

  @Prop({ select: false }) passwordResetTokenHash?: string;
  @Prop({ select: false }) passwordResetExpiresAt?: Date;

  @Prop({ select: false }) otpCodeHash?: string;
  @Prop({ select: false }) otpExpiresAt?: Date;
  @Prop({ default: 0, select: false }) otpAttempts?: number;

  @Prop({ default: false }) isBanned!: boolean;
  @Prop() bannedReason?: string;

  @Prop() googleId?: string;

  @Prop({ type: CustomerPreferencesSchema, default: () => ({}) })
  preferences?: CustomerPreferencesSchema;

  @Prop({ type: BuyerMetricsSchema, default: () => ({}) })
  buyerMetrics?: BuyerMetricsSchema;

  @Prop({ type: CustomerKycSchema, default: () => ({}) })
  kyc?: CustomerKycSchema;

  @Prop({ type: CustomerLoyaltySchema, default: () => ({}) })
  loyalty?: CustomerLoyaltySchema;

  @Prop({ type: [String], default: [] })
  customerTags?: string[];

  @Prop()
  internalNotes?: string;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ approxLocation: '2dsphere' });
UserSchema.index({ 'provider.isProvider': 1 });
UserSchema.index({ name: 'text', bio: 'text', 'provider.businessName': 'text' });
UserSchema.index({ 'kyc.status': 1 });
UserSchema.index({ 'loyalty.tier': 1 });
UserSchema.index({ customerTags: 1 });

// Aliases for clean semantic usage
export { User as Customer, UserSchema as CustomerSchema };
export type { UserDocument as CustomerDocument };

