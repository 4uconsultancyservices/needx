import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NeedsModule } from '../needs/needs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Offer, OfferSchema } from './schemas/offer.schema';
import { OfferHistory, OfferHistorySchema } from './schemas/offer-history.schema';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Offer.name, schema: OfferSchema },
      { name: OfferHistory.name, schema: OfferHistorySchema },
    ]),
    NeedsModule,
    NotificationsModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService, MongooseModule],
})
export class OffersModule {}
