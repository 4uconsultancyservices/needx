import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

let cachedServer: Express | null = null;

export async function bootstrapServer(): Promise<Express> {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
      rawBody: true,
    });

    const config = app.get(ConfigService);
    app.use(helmet());
    app.use(cookieParser());

    const isDev = config.get<string>('app.nodeEnv') !== 'production';
    const configuredOrigin = config.get<string>('app.corsOrigin');

    app.enableCors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) return callback(null, true);
        if (origin === configuredOrigin) return callback(null, true);
        if (isDev) {
          const isLanOrLocal =
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
            /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin) ||
            /^https?:\/\/([a-zA-Z0-9-]+\.)*(local|lan)(:\d+)?$/.test(origin);
          if (isLanOrLocal) return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    });

    app.setGlobalPrefix('api/v1');
    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}
