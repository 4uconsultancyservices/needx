import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ROLES, STAFF_DEPARTMENTS, type Role, type StaffDepartment } from '@needx/types';

export type EmployeeDocument = HydratedDocument<Employee>;

@Schema({ timestamps: true, collection: 'employees' })
export class Employee {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ unique: true, sparse: true })
  phone?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: String, enum: STAFF_DEPARTMENTS, required: true })
  department!: StaffDepartment;

  @Prop({ required: true, trim: true })
  designation!: string;

  @Prop({ type: String, enum: ROLES, default: 'STAFF' })
  role!: Role;

  @Prop({ type: [String], enum: ROLES, default: ['STAFF'] })
  roles!: Role[];

  @Prop({ type: [String], default: [] })
  permissions!: string[];

  @Prop({ default: false })
  isSuspended!: boolean;

  @Prop({ type: [String], default: [] })
  assignedQueues!: string[];

  @Prop()
  city?: string;

  @Prop()
  lastActiveAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
EmployeeSchema.index({ department: 1, isSuspended: 1 });
EmployeeSchema.index({ email: 1 });
