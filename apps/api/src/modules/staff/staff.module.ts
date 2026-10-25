import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from './schemas/employee.schema';
import { StaffProfile, StaffProfileSchema } from './schemas/staff-profile.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: StaffProfile.name, schema: StaffProfileSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuditLogModule,
  ],
  controllers: [StaffController],
  providers: [StaffService, PermissionsGuard],
  exports: [StaffService, PermissionsGuard, MongooseModule],
})
export class StaffModule {}
