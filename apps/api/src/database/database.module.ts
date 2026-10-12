import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

// Applied once, globally, to every schema: every document that goes over the
// wire gets `id` (string) instead of Mongo's `_id`/`__v`. This is what lets
// packages/types (which declares `id: string`) match what the API actually
// returns, without repeating a transform in 20 schema files.
mongoose.plugin((schema) => {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = String(ret._id);
      delete ret._id;
      return ret;
    },
  });
});

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('db.uri'),
        // Fail fast on connection issues instead of buffering commands forever.
        serverSelectionTimeoutMS: 8000,
      }),
    }),
  ],
})
export class DatabaseModule {}
