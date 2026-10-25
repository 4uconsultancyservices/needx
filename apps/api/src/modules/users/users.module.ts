import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Address, AddressSchema } from './schemas/address.schema';
import { CustomerProfile, CustomerProfileSchema } from './schemas/customer-profile.schema';
import { Employee, EmployeeSchema } from '../staff/schemas/employee.schema';
import { UsersService } from './users.service';
import { CustomerProfileService } from './customer-profile.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Address.name, schema: AddressSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, CustomerProfileService],
  exports: [UsersService, CustomerProfileService, MongooseModule],
})
export class UsersModule {}

