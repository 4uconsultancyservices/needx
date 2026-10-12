import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LEDGER_ENTRY_TYPES, type LedgerEntryType } from '@needx/types';

export type LedgerEntryDocument = HydratedDocument<LedgerEntry>;

/**
 * Append-only. Never update or delete a row, never do `user.balance += x`
 * anywhere in the codebase — every financial fact is a new immutable entry
 * here, and any "balance" is a derived SUM over entries, computed on read.
 */
@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'ledger_entries' })
export class LedgerEntry {
  @Prop({ type: Types.ObjectId, ref: 'Order', index: true }) orderId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Payment' }) paymentId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true }) userId?: Types.ObjectId;

  @Prop({ type: String, enum: LEDGER_ENTRY_TYPES, required: true, index: true }) type!: LedgerEntryType;
  @Prop({ required: true }) amount!: number; // signed
  @Prop({ default: 'INR' }) currency!: string;
  @Prop({ required: true }) description!: string;

  createdAt?: Date;
  _id!: Types.ObjectId;
}

export const LedgerEntrySchema = SchemaFactory.createForClass(LedgerEntry);
LedgerEntrySchema.index({ userId: 1, createdAt: -1 });
