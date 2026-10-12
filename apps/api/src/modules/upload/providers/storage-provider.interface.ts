export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

export interface StoredFile {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

/**
 * Abstraction over "put a file somewhere and get a URL back". The default
 * binding writes to local disk (apps/api/uploads/, served statically) since
 * no STORAGE_* (S3-compatible) credentials exist in this environment — see
 * ENVIRONMENT.md. Implement S3StorageProvider and flip STORAGE_DRIVER=s3 to
 * go to production; nothing else in the codebase changes.
 */
export interface StorageProvider {
  upload(file: { buffer: Buffer; originalname: string; mimetype: string; size: number }, folder: string): Promise<StoredFile>;
  delete(key: string): Promise<void>;
}
