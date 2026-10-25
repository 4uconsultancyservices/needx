import { Module } from '@nestjs/common';
import { NeedsModule } from '../needs/needs.module';
import { OffersModule } from '../offers/offers.module';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';

@Module({
  imports: [NeedsModule, OffersModule],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
