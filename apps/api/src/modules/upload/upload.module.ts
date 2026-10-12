import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { STORAGE_PROVIDER } from './providers/storage-provider.interface';
import { LocalDiskStorageProvider } from './providers/local-disk.provider';

@Module({
  controllers: [UploadController],
  providers: [UploadService, { provide: STORAGE_PROVIDER, useClass: LocalDiskStorageProvider }],
  exports: [UploadService],
})
export class UploadModule {}
