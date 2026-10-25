import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppException } from '../common/errors/app.exception';
import { PERMISSIONS_KEY } from '../common/decorators/permissions.decorator';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import type { Role } from '@needx/types';
import type { AuthenticatedUser } from '../modules/auth/types/authenticated-user';
import { Employee } from '../modules/staff/schemas/employee.schema';
import { StaffProfile, type StaffProfileDocument } from '../modules/staff/schemas/staff-profile.schema';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @InjectModel(StaffProfile.name) private readonly staffModel: Model<StaffProfile>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no granular permissions requested, proceed
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    if (!user) {
      throw AppException.forbidden('Sign in required');
    }

    // SUPER_ADMIN has master bypass for all modules and actions
    if (user.roles.includes('SUPER_ADMIN')) {
      return true;
    }

    // Lookup staff profile for this user
    if (!Types.ObjectId.isValid(user.id)) {
      throw AppException.forbidden('Staff authorization required to perform this action');
    }

    let granted: string[] = [];
    const emp = await this.employeeModel.findById(user.id).exec();
    if (emp) {
      if (emp.isSuspended) {
        throw AppException.forbidden('Staff access has been suspended. Please contact platform administration.');
      }
      this.employeeModel.updateOne({ _id: emp._id }, { $set: { lastActiveAt: new Date() } }).exec().catch(() => {});
      granted = emp.permissions || [];
    } else {
      const staff = await this.staffModel.findOne({ userId: new Types.ObjectId(user.id) }).exec();
      if (!staff) {
        throw AppException.forbidden('Staff authorization required to perform this action');
      }
      if (staff.isSuspended) {
        throw AppException.forbidden('Staff access has been suspended. Please contact platform administration.');
      }
      this.staffModel.updateOne({ _id: staff._id }, { $set: { lastActiveAt: new Date() } }).exec().catch(() => {});
      granted = staff.permissions || [];
    }

    // Wildcard master permission
    if (granted.includes('*')) {
      return true;
    }

    // Verify all or any required permissions:
    // A required permission like "users:read" is satisfied by "users:read" or "users:*"
    const isAuthorized = requiredPermissions.every((req) => {
      const [module] = req.split(':');
      return granted.includes(req) || granted.includes(`${module}:*`);
    });

    if (!isAuthorized) {
      throw AppException.forbidden(
        `Insufficient module permissions. Required: [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
