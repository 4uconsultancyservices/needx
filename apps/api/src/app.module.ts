import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { envSchema, validateEnv } from './config/env.validation';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

import { AppController } from './app.controller';

import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AiModule } from './modules/ai/ai.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MatchingModule } from './modules/matching/matching.module';
import { NeedsModule } from './modules/needs/needs.module';
import { ListingsModule } from './modules/listings/listings.module';
import { OffersModule } from './modules/offers/offers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { RentalsModule } from './modules/rentals/rentals.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { UploadModule } from './modules/upload/upload.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => validateEnv(env),
      load: [() => configuration(validateEnv(process.env))],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: (config.get<number>('rateLimit.ttlSeconds') ?? 60) * 1000,
          limit: config.get<number>('rateLimit.max') ?? 120,
        },
      ],
    }),
    DatabaseModule,

    // ---- Foundational ----
    AuditLogModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    AiModule,
    ReportsModule,
    MatchingModule,

    // ---- Marketplace core ----
    NeedsModule,
    ListingsModule,
    OffersModule,
    NotificationsModule,
    OrdersModule,
    RentalsModule,

    // ---- Money ----
    LedgerModule,
    PaymentsModule,

    // ---- Trust & communication ----
    MessagesModule,
    ReviewsModule,
    FavoritesModule,
    DisputesModule,

    // ---- Platform ----
    UploadModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}

export { envSchema };
