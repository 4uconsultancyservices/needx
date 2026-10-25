import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import type { CreateStaffInput, CreateStaffUserInput, UpdateStaffInput } from '@needx/validation';
import {
  STAFF_DEPARTMENTS,
  STAFF_MODULES,
  type Role,
  type StaffDepartment,
} from '@needx/types';
import { AppException } from '../../common/errors/app.exception';
import { Employee, type EmployeeDocument } from './schemas/employee.schema';
import { StaffProfile, type StaffProfileDocument } from './schemas/staff-profile.schema';
import { User, type UserDocument } from '../users/schemas/user.schema';
import { AuditLogService } from '../audit-log/audit-log.service';

export const ROLE_PRESET_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  SUPER_ADMIN_PRESET: ['*'],
  ADMIN: [
    'dashboard:*',
    'users:*',
    'staff:*',
    'needs:*',
    'listings:*',
    'orders:*',
    'categories:*',
    'reports:*',
    'disputes:*',
    'moderation:*',
    'reviews:*',
    'payments:*',
    'notifications:*',
    'settings:*',
  ],
  OPERATIONS_LEAD: [
    'dashboard:*',
    'needs:*',
    'listings:*',
    'orders:*',
    'categories:*',
  ],
  MODERATOR: [
    'dashboard:read',
    'reports:*',
    'disputes:*',
    'moderation:*',
    'reviews:*',
    'users:read',
    'users:ban',
    'needs:read',
    'listings:read',
  ],
  TRUST_SAFETY_MODERATOR: [
    'reports:*',
    'disputes:*',
    'moderation:*',
    'users:ban',
    'users:read',
    'reviews:*',
  ],
  CUSTOMER_SUPPORT: [
    'dashboard:read',
    'users:read',
    'needs:read',
    'listings:read',
    'orders:read',
    'reports:read',
    'disputes:read',
    'reviews:read',
  ],
  SUPPORT_SPECIALIST: [
    'users:read',
    'needs:read',
    'orders:read',
    'disputes:read',
    'disputes:resolve',
    'reviews:read',
    'reviews:update',
  ],
  FINANCE_STAFF: [
    'dashboard:read',
    'payments:*',
    'orders:read',
    'orders:update',
    'disputes:read',
    'users:read',
  ],
  FINANCE_CONTROLLER: [
    'payments:*',
    'orders:read',
    'orders:refund',
  ],
  CATALOG_STAFF: [
    'dashboard:read',
    'categories:*',
    'listings:*',
    'needs:read',
  ],
  CATALOG_MANAGER: [
    'categories:*',
    'listings:*',
  ],
};

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>,
    @InjectModel(StaffProfile.name)
    private readonly staffModel: Model<StaffProfile>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly auditLog: AuditLogService,
  ) {}

  private formatEmployee(emp: EmployeeDocument | any) {
    const idStr = emp._id ? emp._id.toString() : emp.id;
    const profileObj = {
      id: idStr,
      userId: idStr,
      department: emp.department,
      designation: emp.designation,
      role: emp.role || 'STAFF',
      permissions: emp.permissions || [],
      isSuspended: Boolean(emp.isSuspended),
      assignedQueues: emp.assignedQueues || [],
      lastActiveAt: emp.lastActiveAt ? (emp.lastActiveAt instanceof Date ? emp.lastActiveAt.toISOString() : emp.lastActiveAt) : undefined,
      createdAt: emp.createdAt ? (emp.createdAt instanceof Date ? emp.createdAt.toISOString() : emp.createdAt) : new Date().toISOString(),
      updatedAt: emp.updatedAt ? (emp.updatedAt instanceof Date ? emp.updatedAt.toISOString() : emp.updatedAt) : new Date().toISOString(),
    };

    return {
      id: idStr,
      userId: idStr,
      name: emp.name || 'Unknown Employee',
      email: emp.email || '',
      phone: emp.phone,
      avatarUrl: emp.avatarUrl,
      roles: emp.roles || ['STAFF', emp.role || 'STAFF'],
      isBanned: Boolean(emp.isSuspended),
      staffProfile: profileObj,
      department: emp.department,
      designation: emp.designation,
      role: emp.role || 'STAFF',
      permissions: emp.permissions || [],
      isSuspended: Boolean(emp.isSuspended),
      assignedQueues: emp.assignedQueues || [],
      lastActiveAt: profileObj.lastActiveAt,
      createdAt: profileObj.createdAt,
    };
  }

  private formatLegacyStaff(doc: any) {
    const u = doc.userId as unknown as UserDocument;
    const userIdStr = u?._id?.toString() || (doc.userId ? doc.userId.toString() : doc.id);
    const profileObj = {
      id: doc._id.toString(),
      userId: userIdStr,
      department: doc.department,
      designation: doc.designation,
      role: doc.role,
      permissions: doc.permissions || [],
      isSuspended: Boolean(doc.isSuspended),
      assignedQueues: doc.assignedQueues || [],
      lastActiveAt: doc.lastActiveAt ? doc.lastActiveAt.toISOString() : undefined,
      createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
    };

    return {
      id: userIdStr,
      userId: userIdStr,
      name: u?.name || 'Unknown User',
      email: u?.email || '',
      phone: u?.phone,
      avatarUrl: u?.avatarUrl,
      roles: u?.roles || [],
      isBanned: Boolean(u?.isBanned),
      staffProfile: profileObj,
      department: doc.department,
      designation: doc.designation,
      role: doc.role,
      permissions: doc.permissions || [],
      isSuspended: Boolean(doc.isSuspended),
      assignedQueues: doc.assignedQueues || [],
      lastActiveAt: profileObj.lastActiveAt,
      createdAt: u?.createdAt ? u.createdAt.toISOString() : new Date().toISOString(),
    };
  }

  async listStaff(params: {
    page: number;
    limit: number;
    q?: string;
    department?: StaffDepartment;
  }) {
    const filter: Record<string, any> = {};
    if (params.department) {
      filter.department = params.department;
    }
    if (params.q && params.q.trim()) {
      const q = params.q.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { designation: { $regex: q, $options: 'i' } },
      ];
    }

    // First query dedicated employees collection
    const [empItems, empTotal] = await Promise.all([
      this.employeeModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .exec(),
      this.employeeModel.countDocuments(filter).exec(),
    ]);

    if (empTotal > 0 || !params.department) {
      if (empItems.length > 0) {
        return {
          items: empItems.map((emp) => this.formatEmployee(emp)),
          total: empTotal,
        };
      }
    }

    // Fallback query to legacy staff_profiles collection
    const [items, total] = await Promise.all([
      this.staffModel
        .find(filter)
        .populate('userId', 'name email phone avatarUrl roles isBanned createdAt')
        .sort({ createdAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .exec(),
      this.staffModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((doc) => this.formatLegacyStaff(doc)),
      total,
    };
  }

  async getStaffByUserId(userId: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(userId)) return null;

    // Check dedicated employees collection first
    const emp = await this.employeeModel.findById(userId).exec();
    if (emp) return this.formatEmployee(emp);

    // Fallback to legacy staffModel
    return this.staffModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }

  async assignStaff(input: CreateStaffInput, actorId: string) {
    if (!Types.ObjectId.isValid(input.userId)) {
      throw AppException.badRequest('Invalid user id');
    }

    // Default permissions from preset if empty
    const assignedRole = input.role as Role;
    const effectivePermissions =
      input.permissions && input.permissions.length > 0
        ? input.permissions
        : ROLE_PRESET_PERMISSIONS[input.role] || ['dashboard:read'];

    // Check if exists in employees collection
    let emp = await this.employeeModel.findById(input.userId).exec();
    if (emp) {
      emp.department = input.department;
      emp.designation = input.designation;
      emp.role = assignedRole;
      if (!emp.roles.includes(assignedRole)) emp.roles.push(assignedRole);
      emp.permissions = effectivePermissions;
      emp.assignedQueues = input.assignedQueues ?? [];
      await emp.save();
      return this.formatEmployee(emp);
    }

    const user = await this.userModel.findById(input.userId).exec();
    if (user) {
      // Migrate to dedicated employees collection
      emp = await this.employeeModel.create({
        _id: user._id,
        name: user.name,
        email: user.email,
        passwordHash: (user as any).passwordHash || 'migrated',
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        department: input.department,
        designation: input.designation,
        role: assignedRole,
        roles: Array.from(new Set(['STAFF', assignedRole, ...user.roles])),
        permissions: effectivePermissions,
        assignedQueues: input.assignedQueues ?? [],
        isSuspended: false,
        lastActiveAt: new Date(),
      });

      await this.auditLog.record({
        actorId,
        action: 'STAFF_ASSIGNED',
        targetType: 'Employee',
        targetId: input.userId,
        metadata: { department: input.department, role: assignedRole, designation: input.designation },
      });

      return this.formatEmployee(emp);
    }

    throw AppException.notFound('User not found');
  }

  async createStaffUser(input: CreateStaffUserInput, actorId: string) {
    const existingEmp = await this.employeeModel.findOne({ email: input.email.toLowerCase() }).exec();
    if (existingEmp) {
      throw AppException.conflict('An employee with this email address already exists', 'EMAIL_TAKEN');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const assignedRole = input.role as Role;
    const roles: Role[] = ['STAFF', assignedRole];
    if (assignedRole === 'SUPER_ADMIN' && !roles.includes('ADMIN')) {
      roles.push('ADMIN');
    }

    const effectivePermissions =
      input.permissions && input.permissions.length > 0
        ? input.permissions
        : ROLE_PRESET_PERMISSIONS[input.role] || ['dashboard:read'];

    // Create directly in dedicated employees collection!
    const employee = await this.employeeModel.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      phone: input.phone,
      city: input.city || 'Delhi',
      department: input.department,
      designation: input.designation,
      role: assignedRole,
      roles: Array.from(new Set(roles)),
      permissions: effectivePermissions,
      assignedQueues: input.assignedQueues ?? [],
      isSuspended: false,
      lastActiveAt: new Date(),
    });

    await this.auditLog.record({
      actorId,
      action: 'STAFF_CREATED',
      targetType: 'Employee',
      targetId: employee._id.toString(),
      metadata: { department: input.department, role: assignedRole, designation: input.designation },
    });

    return this.formatEmployee(employee);
  }

  async updateStaff(userId: string, input: UpdateStaffInput, actorId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw AppException.badRequest('Invalid user id');
    }

    // Check dedicated employees collection first
    const employee = await this.employeeModel.findById(userId).exec();
    if (employee) {
      if (input.department) employee.department = input.department;
      if (input.designation) employee.designation = input.designation;
      if (input.role) {
        employee.role = input.role as Role;
        if (!employee.roles.includes(input.role as Role)) {
          employee.roles.push(input.role as Role);
        }
      }
      if (input.permissions) employee.permissions = input.permissions;
      if (input.assignedQueues) employee.assignedQueues = input.assignedQueues;
      if (input.isSuspended !== undefined) employee.isSuspended = input.isSuspended;

      employee.markModified('permissions');
      employee.markModified('assignedQueues');
      employee.markModified('roles');
      await employee.save();

      await this.auditLog.record({
        actorId,
        action: 'STAFF_UPDATED',
        targetType: 'Employee',
        targetId: userId,
        metadata: { input },
      });

      return this.formatEmployee(employee);
    }

    // Fallback for legacy staffProfile
    const staff = await this.staffModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!staff) {
      throw AppException.notFound('Staff profile not found');
    }

    if (input.department) staff.department = input.department;
    if (input.designation) staff.designation = input.designation;
    if (input.role) staff.role = input.role as Role;
    if (input.permissions) staff.permissions = input.permissions;
    if (input.assignedQueues) staff.assignedQueues = input.assignedQueues;
    if (input.isSuspended !== undefined) staff.isSuspended = input.isSuspended;

    staff.markModified('permissions');
    staff.markModified('assignedQueues');
    await staff.save();

    await this.auditLog.record({
      actorId,
      action: 'STAFF_UPDATED',
      targetType: 'User',
      targetId: userId,
      metadata: { input },
    });

    return staff;
  }

  async revokeStaff(userId: string, actorId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw AppException.badRequest('Invalid user id');
    }

    await this.employeeModel.deleteOne({ _id: new Types.ObjectId(userId) }).exec();
    await this.staffModel.deleteOne({ userId: new Types.ObjectId(userId) }).exec();

    await this.auditLog.record({
      actorId,
      action: 'STAFF_REVOKED',
      targetType: 'Employee',
      targetId: userId,
    });

    return { revoked: true };
  }

  getPermissionCatalog() {
    return {
      modules: STAFF_MODULES,
      departments: STAFF_DEPARTMENTS,
      rolePresets: ROLE_PRESET_PERMISSIONS,
      actions: ['create', 'read', 'update', 'delete', 'manage'],
    };
  }
}
