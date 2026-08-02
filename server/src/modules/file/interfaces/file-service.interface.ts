import { FileCategory, FileVisibility, NamingStrategyType, StorageProviderType } from '../types/file.types';
import { IFileMetadata } from './file-metadata.interface';

/**
 * Upload Options payload passed to FileService.
 */
export interface IFileUploadOptions {
  category: FileCategory;
  visibility?: FileVisibility;
  originalFilename: string;
  mimeType: string;
  uploadedBy?: string;
  folder?: string;
  provider?: StorageProviderType;
  namingStrategy?: NamingStrategyType;
  customPrefix?: string;
  overwrite?: boolean;
}

/**
 * Enterprise File Application Service Interface Boundary (Clean Architecture).
 */
export interface IFileService {
  /**
   * Validates, processes, and dispatches a file upload through the configured storage provider pipeline.
   * @param file Raw file buffer data
   * @param options Upload configuration options
   */
  uploadFile(file: Buffer, options: IFileUploadOptions): Promise<IFileMetadata>;

  /**
   * Deletes an asset file from storage provider.
   * @param pathOrKey File path or cloud key identifier
   * @param providerType Optional explicit provider type
   */
  deleteFile(pathOrKey: string, providerType?: StorageProviderType): Promise<boolean>;

  /**
   * Replaces an existing asset file with a new file upload.
   * @param oldPathOrKey Old file path or key to delete
   * @param newFile Replacement file buffer data
   * @param options New upload options
   */
  replaceFile(
    oldPathOrKey: string,
    newFile: Buffer,
    options: IFileUploadOptions
  ): Promise<IFileMetadata>;

  /**
   * Generates a time-limited signed access URL for private assets.
   * @param pathOrKey File path or key
   * @param expiresInSeconds Duration in seconds
   * @param providerType Optional provider type
   */
  getSignedUrl(
    pathOrKey: string,
    expiresInSeconds?: number,
    providerType?: StorageProviderType
  ): Promise<string>;

  /**
   * Checks if an asset exists in storage.
   * @param pathOrKey File path or key
   * @param providerType Optional provider type
   */
  fileExists(pathOrKey: string, providerType?: StorageProviderType): Promise<boolean>;
}
