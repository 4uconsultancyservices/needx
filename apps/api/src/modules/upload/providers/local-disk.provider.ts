import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import type { StorageProvider, StoredFile } from './storage-provider.interface';

const UPLOAD_ROOT = join(process.cwd(), 'uploads');

@Injectable()
export class LocalDiskStorageProvider implements StorageProvider {
  constructor(private readonly config: ConfigService) {}

  async upload(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    folder: string,
  ): Promise<StoredFile> {
    const dir = join(UPLOAD_ROOT, folder);
    await mkdir(dir, { recursive: true });

    const key = `${folder}/${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    await writeFile(join(UPLOAD_ROOT, key), file.buffer);

    const base = this.config.get<string>('storage.publicBaseUrl');
    return { url: `${base}/${key}`, key, size: file.size, mimeType: file.mimetype };
  }

  async delete(key: string): Promise<void> {
    await unlink(join(UPLOAD_ROOT, key)).catch(() => undefined);
  }
}
