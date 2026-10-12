import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from '../orders/orders.module';
import { NeedsModule } from '../needs/needs.module';
import { LedgerModule } from '../ledger/ledger.module';
import { Rental, RentalSchema } from './schemas/rental.schema';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Rental.name, schema: RentalSchema }]), OrdersModule, NeedsModule, LedgerModule],
  controllers: [RentalsController],
  providers: [RentalsService],
  exports: [RentalsService],
})
export class RentalsModule {}
