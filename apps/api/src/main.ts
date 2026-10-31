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
  const isDev = config.get<string>('app.nodeEnv') !== 'production';
  const configuredOrigin = config.get<string>('app.corsOrigin');

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile native apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (origin === configuredOrigin) return callback(null, true);
      if (isDev) {
        // In local development, permit localhost, 127.0.0.1, and private LAN IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        const isLanOrLocal =
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
          /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin) ||
          /^https?:\/\/([a-zA-Z0-9-]+\.)*(local|lan)(:\d+)?$/.test(origin);

        if (isLanOrLocal) {
          return callback(null, true);
        }
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
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
