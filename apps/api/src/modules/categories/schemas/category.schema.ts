import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { CategoryAttributeType } from '@needx/types';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ _id: false })
class CategoryAttributeDef {
  @Prop({ required: true }) key!: string;
  @Prop({ required: true }) label!: string;
  @Prop({ type: String, required: true, enum: ['TEXT', 'NUMBER', 'SELECT', 'MULTISELECT', 'BOOLEAN'] })
  type!: CategoryAttributeType;
  @Prop({ default: false }) required?: boolean;
  @Prop({ type: [String] }) options?: string[];
  @Prop() unit?: string;
}

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({ required: true }) name!: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true }) slug!: string;
  @Prop() icon?: string;
  @Prop() description?: string;
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null }) parentId?: Types.ObjectId | null;
  @Prop({ type: [String], default: [], index: true }) keywords!: string[];
  @Prop({ type: [CategoryAttributeDef], default: [] }) attributes!: CategoryAttributeDef[];
  @Prop({ default: true }) isActive!: boolean;
  @Prop({ default: 0 }) sortOrder!: number;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ name: 'text', keywords: 'text', description: 'text' });
