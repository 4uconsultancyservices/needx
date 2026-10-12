import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '../../common/errors/app.exception';
import { STORAGE_PROVIDER, type StorageProvider, type StoredFile } from './providers/storage-provider.interface';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export type UploadFolder = 'avatars' | 'listings' | 'need-attachments' | 'chat' | 'dispute-evidence';

@Injectable()
export class UploadService {
  constructor(@Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider) {}

  async handle(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number } | undefined,
    folder: UploadFolder,
  ): Promise<StoredFile> {
    if (!file) throw AppException.validation({ file: 'No file was uploaded' });
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw AppException.validation({ file: `Unsupported file type: ${file.mimetype}` });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw AppException.validation({ file: 'File exceeds the 10MB limit' });
    }
    return this.storage.upload(file, folder);
  }
}
