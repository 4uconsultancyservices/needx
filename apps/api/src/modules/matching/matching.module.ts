import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { Need, NeedSchema } from '../needs/schemas/need.schema';
import { Listing, ListingSchema } from '../listings/schemas/listing.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { MatchingService } from './matching.service';

/**
 * Reads directly from Need/Listing/User collections rather than depending on
 * NeedsModule/ListingsModule — matching is a cross-cutting query service and
 * this avoids a circular module dependency (Needs -> Matching -> Needs).
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Need.name, schema: NeedSchema },
      { name: Listing.name, schema: ListingSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AiModule,
  ],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
