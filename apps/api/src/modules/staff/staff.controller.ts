import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  createStaffInputSchema,
  createStaffUserInputSchema,
  updateStaffInputSchema,
  type CreateStaffInput,
  type CreateStaffUserInput,
  type UpdateStaffInput,
} from '@needx/validation';
import type { StaffDepartment } from '@needx/types';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { StaffService } from './staff.service';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'STAFF', 'MODERATOR')
@Controller('admin/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('permissions-catalog')
  permissionsCatalog() {
    return this.staffService.getPermissionCatalog();
  }

  @Get('me')
  async myStaffProfile(@CurrentUser() user: AuthenticatedUser) {
    if (user.roles.includes('SUPER_ADMIN')) {
      return {
        isStaff: true,
        isSuperAdmin: true,
        department: 'EXECUTIVE',
        designation: 'Super Administrator',
        role: 'SUPER_ADMIN',
        permissions: ['*'],
      };
    }

    const staff = await this.staffService.getStaffByUserId(user.id);
    if (!staff) {
      return {
        isStaff: false,
        isSuperAdmin: false,
        permissions: [],
      };
    }

    return {
      isStaff: true,
      isSuperAdmin: false,
      department: staff.department,
      designation: staff.designation,
      role: staff.role,
      permissions: staff.permissions,
      assignedQueues: staff.assignedQueues,
      isSuspended: staff.isSuspended,
    };
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('q') q?: string,
    @Query('department') department?: StaffDepartment,
  ) {
    const { items, total } = await this.staffService.listStaff({
      page: Number(page),
      limit: Number(limit),
      q,
      department,
    });
    return { data: items, meta: { total, page: Number(page), limit: Number(limit) } };
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get(':userId')
  async getOne(@Param('userId') userId: string) {
    return this.staffService.getStaffByUserId(userId);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  @UsePipes(new ZodValidationPipe(createStaffInputSchema))
  async assign(@CurrentUser() admin: AuthenticatedUser, @Body() dto: CreateStaffInput) {
    return this.staffService.assignStaff(dto, admin.id);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('create-user')
  @UsePipes(new ZodValidationPipe(createStaffUserInputSchema))
  async createUser(@CurrentUser() admin: AuthenticatedUser, @Body() dto: CreateStaffUserInput) {
    return this.staffService.createStaffUser(dto, admin.id);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':userId')
  @UsePipes(new ZodValidationPipe(updateStaffInputSchema))
  async update(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() dto: UpdateStaffInput,
  ) {
    return this.staffService.updateStaff(userId, dto, admin.id);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':userId')
  async revoke(@CurrentUser() admin: AuthenticatedUser, @Param('userId') userId: string) {
    return this.staffService.revokeStaff(userId, admin.id);
  }
}
