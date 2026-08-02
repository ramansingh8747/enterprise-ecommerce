import { IStorageProvider } from '../interfaces/storage-provider.interface';
import { StorageProviderType } from '../types/file.types';
import { IFileMetadata } from '../interfaces/file-metadata.interface';
import { StorageError } from '../errors/file.errors';

export class CloudinaryStorageProvider implements IStorageProvider {
  readonly providerType = StorageProviderType.CLOUDINARY;

  async upload(_file: Buffer | Uint8Array, _metadata: Partial<IFileMetadata>): Promise<IFileMetadata> {
    throw new StorageError('CloudinaryStorageProvider.upload is an architecture contract placeholder.');
  }

  async delete(_pathOrKey: string): Promise<boolean> {
    throw new StorageError('CloudinaryStorageProvider.delete is an architecture contract placeholder.');
  }

  async exists(_pathOrKey: string): Promise<boolean> {
    return false;
  }

  async copy(_sourceKey: string, _destKey: string): Promise<boolean> {
    return false;
  }

  async move(_sourceKey: string, _destKey: string): Promise<boolean> {
    return false;
  }

  async getMetadata(_pathOrKey: string): Promise<IFileMetadata | null> {
    return null;
  }

  async getSignedUrl(pathOrKey: string, _expiresInSeconds: number): Promise<string> {
    return `https://res.cloudinary.com/demo/image/upload/${pathOrKey}`;
  }
}
