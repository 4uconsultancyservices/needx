import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TRANSACTION_MODES, type TransactionMode } from '@needx/types';

export type CustomerProfileDocument = HydratedDocument<CustomerProfile>;

@Schema({ _id: false })
class NotificationPreferences {
  @Prop({ default: true }) email!: boolean;
  @Prop({ default: true }) sms!: boolean;
  @Prop({ default: true }) push!: boolean;
  @Prop({ default: false }) whatsapp!: boolean;
}

@Schema({ _id: false })
export class CustomerPreferencesSchema {
  @Prop({ type: [String], default: [] }) preferredCategories!: string[];
  @Prop({ type: [String], enum: TRANSACTION_MODES, default: ['BUY', 'RENT'] }) preferredModes!: TransactionMode[];
  @Prop({ default: 25 }) searchRadiusKm!: number;
  @Prop({ default: 'INR' }) currency!: string;
  @Prop({ type: String, enum: ['ECONOMY', 'STANDARD', 'PREMIUM'], default: 'STANDARD' }) budgetTier!: string;
  @Prop({ type: NotificationPreferences, default: () => ({}) }) notifications!: NotificationPreferences;
}

@Schema({ _id: false })
export class BuyerMetricsSchema {
  @Prop({ default: 0 }) totalNeedsPosted!: number;
  @Prop({ default: 0 }) totalOrdersPlaced!: number;
  @Prop({ default: 0 }) totalAmountSpent!: number;
  @Prop({ default: 0 }) activeNeedsCount!: number;
  @Prop({ default: 0 }) averageOrderValue!: number;
  @Prop({ default: 1 }) fulfillmentRate!: number;
}

@Schema({ _id: false })
export class CustomerKycSchema {
  @Prop({ type: String, enum: ['NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED'], default: 'NOT_SUBMITTED' })
  status!: string;

  @Prop({ type: String, enum: ['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID'] })
  documentType?: string;

  @Prop() idNumberMasked?: string;
  @Prop() verifiedAt?: Date;
  @Prop() rejectionReason?: string;
}

@Schema({ _id: false })
export class CustomerLoyaltySchema {
  @Prop({ type: String, enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'], default: 'BRONZE' })
  tier!: string;

  @Prop({ default: 0 }) points!: number;
  @Prop({ default: 0 }) lifetimePoints!: number;
}

@Schema({ timestamps: true, collection: 'customer_profiles' })
export class CustomerProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: CustomerPreferencesSchema, default: () => ({}) })
  preferences!: CustomerPreferencesSchema;

  @Prop({ type: BuyerMetricsSchema, default: () => ({}) })
  buyerMetrics!: BuyerMetricsSchema;

  @Prop({ type: CustomerKycSchema, default: () => ({}) })
  kyc!: CustomerKycSchema;

  @Prop({ type: CustomerLoyaltySchema, default: () => ({}) })
  loyalty!: CustomerLoyaltySchema;

  @Prop({ type: [String], default: [] })
  customerTags!: string[];

  @Prop()
  internalNotes?: string;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const CustomerProfileSchema = SchemaFactory.createForClass(CustomerProfile);
CustomerProfileSchema.index({ customerTags: 1 });
CustomerProfileSchema.index({ 'kyc.status': 1 });
CustomerProfileSchema.index({ 'loyalty.tier': 1 });
