import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { ReportsModule } from '../reports/reports.module';
import { MatchingModule } from '../matching/matching.module';
import { Need, NeedSchema } from './schemas/need.schema';
import { NeedsService } from './needs.service';
import { NeedsController } from './needs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Need.name, schema: NeedSchema }]),
    AiModule,
    ReportsModule,
    MatchingModule,
  ],
  controllers: [NeedsController],
  providers: [NeedsService],
  exports: [NeedsService, MongooseModule],
})
export class NeedsModule {}
