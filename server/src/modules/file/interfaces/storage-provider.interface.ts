import { StorageProviderType } from '../types/file.types';
import { IFileMetadata } from './file-metadata.interface';

/**
 * Universal Storage Provider Strategy Interface (Strategy Pattern / DIP).
 * 
 * Contract that every storage provider vendor (Local, Cloudinary, S3, Azure, GCS, Mock)
 * must implement to plug into the core File Management architecture.
 */
export interface IStorageProvider {
  /**
   * Storage provider vendor identifier type.
   */
  readonly providerType: StorageProviderType;

  /**
   * Uploads file buffer or stream to target storage destination.
   * @param file File buffer data
   * @param metadata Partial file metadata detailing category, visibility, filename, etc.
   */
  upload(file: Buffer | Uint8Array, metadata: Partial<IFileMetadata>): Promise<IFileMetadata>;

  /**
   * Deletes an asset file from storage destination.
   * @param pathOrKey File path or cloud key identifier
   */
  delete(pathOrKey: string): Promise<boolean>;

  /**
   * Checks if an asset file exists in storage destination.
   * @param pathOrKey File path or cloud key identifier
   */
  exists(pathOrKey: string): Promise<boolean>;

  /**
   * Copies an asset file from source key to destination key.
   * @param sourceKey Source file path/key
   * @param destKey Target file path/key
   */
  copy(sourceKey: string, destKey: string): Promise<boolean>;

  /**
   * Moves/renames an asset file from source key to destination key.
   * @param sourceKey Source file path/key
   * @param destKey Target file path/key
   */
  move(sourceKey: string, destKey: string): Promise<boolean>;

  /**
   * Retrieves asset metadata from storage provider.
   * @param pathOrKey File path or cloud key identifier
   */
  getMetadata(pathOrKey: string): Promise<IFileMetadata | null>;

  /**
   * Generates a temporary time-limited signed URL for private asset access.
   * @param pathOrKey File path or cloud key identifier
   * @param expiresInSeconds Signed URL expiration duration in seconds
   */
  getSignedUrl(pathOrKey: string, expiresInSeconds: number): Promise<string>;
}
