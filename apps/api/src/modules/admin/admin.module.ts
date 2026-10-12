import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { NeedsModule } from '../needs/needs.module';
import { ListingsModule } from '../listings/listings.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { LedgerModule } from '../ledger/ledger.module';
import { DisputesModule } from '../disputes/disputes.module';
import { ReportsModule } from '../reports/reports.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NeedsModule,
    ListingsModule,
    OrdersModule,
    UsersModule,
    LedgerModule,
    DisputesModule,
    ReportsModule,
    AuditLogModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
