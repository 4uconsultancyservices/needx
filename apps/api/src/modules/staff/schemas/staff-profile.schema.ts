import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ROLES, STAFF_DEPARTMENTS, type Role, type StaffDepartment } from '@needx/types';

export type StaffProfileDocument = HydratedDocument<StaffProfile>;

@Schema({ timestamps: true, collection: 'staff_profiles' })
export class StaffProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: STAFF_DEPARTMENTS, required: true })
  department!: StaffDepartment;

  @Prop({ required: true, trim: true })
  designation!: string;

  @Prop({ type: String, enum: ROLES, default: 'STAFF' })
  role!: Role;

  @Prop({ type: [String], default: [] })
  permissions!: string[];

  @Prop({ default: false })
  isSuspended!: boolean;

  @Prop({ type: [String], default: [] })
  assignedQueues!: string[];

  @Prop()
  lastActiveAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const StaffProfileSchema = SchemaFactory.createForClass(StaffProfile);
StaffProfileSchema.index({ department: 1, isSuspended: 1 });
