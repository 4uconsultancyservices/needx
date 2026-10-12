import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { EmbeddingService } from './embedding.service';
import { NeedsParserService } from './needs-parser.service';
import { ModerationService } from './moderation.service';

/**
 * The "AI" seam described in the project spec (parseNeed, classifyCategory,
 * moderateContent, generateEmbedding, recommendProviders). Every function
 * here works with zero external API calls — see each service's doc comment
 * for exactly what a real model would improve and where to plug it in via
 * AI_PROVIDER / AI_API_KEY.
 */
@Module({
  imports: [CategoriesModule],
  providers: [EmbeddingService, NeedsParserService, ModerationService],
  exports: [EmbeddingService, NeedsParserService, ModerationService],
})
export class AiModule {}
