import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  LISTING_STATUSES,
  LISTING_TYPES,
  PRICE_UNITS,
  TRANSACTION_MODES,
  type ListingStatus,
  type ListingType,
  type PriceUnit,
  type TransactionMode,
  type DamageProtectionPlan,
  type ConditionGrade,
  type CancellationPolicy,
  type HandoverOption,
  type GalleryImageTag,
} from '@needx/types';

export type ListingDocument = HydratedDocument<Listing>;

@Schema({ _id: false })
class ListingPriceSchema {
  @Prop({ required: true }) amount!: number;
  @Prop({ default: 'INR' }) currency!: string;
  @Prop({ type: String, enum: PRICE_UNITS }) unit?: PriceUnit;
}

@Schema({ _id: false })
class GeoPointSchema {
  @Prop({ type: String, enum: ['Point'], default: 'Point' }) type!: 'Point';
  @Prop({ type: [Number], required: true }) coordinates!: [number, number];
}

@Schema({ _id: false })
class LocationInfoSchema {
  @Prop({ type: GeoPointSchema, required: true }) point!: GeoPointSchema;
  @Prop({ required: true }) label!: string;
  @Prop() city?: string;
  @Prop() state?: string;
}

@Schema({ _id: false })
class ListingGalleryItemSchema {
  @Prop({ required: true }) url!: string;
  @Prop() caption?: string;
  @Prop({ default: false }) isCover?: boolean;
  @Prop({ type: String }) tag?: GalleryImageTag;
}

@Schema({ _id: false })
class ListingProtectionSchema {
  @Prop() securityDeposit?: number;
  @Prop() replacementValue?: number;
  @Prop({ type: String, default: 'STANDARD' }) damageProtectionPlan?: DamageProtectionPlan;
  @Prop({ default: true }) coversAccidentalDamage?: boolean;
  @Prop({ default: true }) coversTheftWithFIR?: boolean;
  @Prop({ default: false }) coversMechanicalBreakdown?: boolean;
  @Prop({ default: 10 }) deductiblePercent?: number;
  @Prop({ default: true }) inspectionRequired?: boolean;
  @Prop({ default: true }) idVerificationRequired?: boolean;
  @Prop() damageClaimProtocol?: string;
}

@Schema({ _id: false })
class ListingSpecificationSchema {
  @Prop() brand?: string;
  @Prop() model?: string;
  @Prop() yearOrAge?: string;
  @Prop({ type: String, default: 'EXCELLENT' }) conditionGrade?: ConditionGrade;
  @Prop() conditionNotes?: string;
  @Prop({ default: false }) serialNumberProtected?: boolean;
  @Prop({ type: [String], default: [] }) includedAccessories?: string[];
  @Prop() dimensionsOrSize?: string;
  @Prop() weight?: string;
  @Prop({ type: Object, default: {} }) customSpecs?: Record<string, string>;
}

@Schema({ _id: false })
class ListingRentalTermsSchema {
  @Prop({ default: 1 }) minRentalDays?: number;
  @Prop({ default: 30 }) maxRentalDays?: number;
  @Prop({ type: String, default: 'FLEXIBLE' }) cancellationPolicy?: CancellationPolicy;
  @Prop({ type: [String], default: ['LOCAL_PICKUP'] }) handoverOptions?: HandoverOption[];
  @Prop({ default: 0 }) deliveryFee?: number;
  @Prop({ default: 0 }) lateFeePerDay?: number;
  @Prop() usageGuidelines?: string;
}

@Schema({ timestamps: true, collection: 'listings' })
export class Listing {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) providerId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true }) categoryId!: Types.ObjectId;

  @Prop({ required: true, trim: true }) title!: string;
  @Prop({ required: true }) description!: string;

  @Prop({ type: String, enum: LISTING_TYPES, required: true }) type!: ListingType;
  @Prop({ type: [String], enum: TRANSACTION_MODES, required: true }) modes!: TransactionMode[];

  @Prop({ type: ListingPriceSchema, required: true }) price!: ListingPriceSchema;
  @Prop() deposit?: number;
  @Prop({ default: 1 }) quantity!: number;
  @Prop() condition?: string;

  @Prop({ type: [String], default: [] }) images!: string[];

  @Prop({ type: LocationInfoSchema, required: true }) location!: LocationInfoSchema;
  @Prop({ type: Object, default: {} }) attributes!: Record<string, unknown>;

  @Prop({ type: String, enum: LISTING_STATUSES, default: 'ACTIVE', index: true }) status!: ListingStatus;

  @Prop({ default: 0 }) viewCount?: number;
  @Prop({ default: 0 }) favoriteCount?: number;

  // Rich extensions
  @Prop({ type: ListingProtectionSchema }) protection?: ListingProtectionSchema;
  @Prop({ type: ListingSpecificationSchema }) specifications?: ListingSpecificationSchema;
  @Prop({ type: ListingRentalTermsSchema }) rentalTerms?: ListingRentalTermsSchema;
  @Prop({ type: [ListingGalleryItemSchema], default: [] }) gallery?: ListingGalleryItemSchema[];

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);
ListingSchema.index({ 'location.point': '2dsphere' });
ListingSchema.index({ title: 'text', description: 'text' });
ListingSchema.index({ status: 1, categoryId: 1, createdAt: -1 });
ListingSchema.index({ providerId: 1, status: 1 });
