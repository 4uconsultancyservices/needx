import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { ReportsModule } from '../reports/reports.module';
import { MatchingModule } from '../matching/matching.module';
import { Listing, ListingSchema } from './schemas/listing.schema';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }]),
    AiModule,
    ReportsModule,
    MatchingModule,
  ],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService, MongooseModule],
})
export class ListingsModule {}
