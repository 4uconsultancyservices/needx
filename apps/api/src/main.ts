import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Exposes request.rawBody (Buffer) alongside the normal parsed body —
    // required so the payments webhook can verify an HMAC signature over
    // the exact bytes that were signed, not a re-serialized JSON.stringify.
    rawBody: true,
  });

  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: config.get<string>('app.corsOrigin'),
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  const port = config.get<number>('app.port') ?? 4000;
  await app.listen(port);
  logger.log(`NEEDX API listening on http://localhost:${port}/api/v1`);
  logger.log(`Environment: ${config.get<string>('app.nodeEnv')}`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
