import { IStorageProvider } from '../interfaces/storage-provider.interface';
import { StorageProviderType, FileVisibility, FileCategory } from '../types/file.types';
import { IFileMetadata } from '../interfaces/file-metadata.interface';

/**
 * Mock Storage Provider Implementation (Module 21.1).
 * Used for local testing and CI/CD pipelines without connecting to real cloud storage.
 */
export class MockStorageProvider implements IStorageProvider {
  readonly providerType = StorageProviderType.MOCK;

  async upload(file: Buffer | Uint8Array, metadata: Partial<IFileMetadata>): Promise<IFileMetadata> {
    const filename = metadata.filename || `mock-file-${Date.now()}.png`;

    return {
      filename,
      originalFilename: metadata.originalFilename || filename,
      mimeType: metadata.mimeType || 'image/png',
      extension: metadata.extension || 'png',
      size: file.length,
      category: metadata.category || FileCategory.SYSTEM,
      uploadedBy: metadata.uploadedBy || 'system',
      uploadedAt: new Date(),
      provider: this.providerType,
      bucket: 'mock-bucket',
      folder: metadata.folder || 'mock-folder',
      visibility: metadata.visibility || FileVisibility.PUBLIC,
      url: `https://mock-storage.internal/${metadata.folder || 'mock'}/${filename}`,
    };
  }

  async delete(_pathOrKey: string): Promise<boolean> {
    return true;
  }

  async exists(_pathOrKey: string): Promise<boolean> {
    return true;
  }

  async copy(_sourceKey: string, _destKey: string): Promise<boolean> {
    return true;
  }

  async move(_sourceKey: string, _destKey: string): Promise<boolean> {
    return true;
  }

  async getMetadata(pathOrKey: string): Promise<IFileMetadata | null> {
    return {
      filename: pathOrKey,
      originalFilename: pathOrKey,
      mimeType: 'image/png',
      extension: 'png',
      size: 1024,
      category: FileCategory.SYSTEM,
      uploadedAt: new Date(),
      provider: this.providerType,
      visibility: FileVisibility.PUBLIC,
      url: `https://mock-storage.internal/mock/${pathOrKey}`,
    };
  }

  async getSignedUrl(pathOrKey: string, _expiresInSeconds: number): Promise<string> {
    return `https://mock-storage.internal/signed/${pathOrKey}?token=mock-signed-token`;
  }
}
