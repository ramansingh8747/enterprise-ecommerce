import { IFileService, IFileUploadOptions } from '../interfaces/file-service.interface';
import { IStorageProviderFactory } from '../interfaces/storage-factory.interface';
import { INamingStrategy } from '../interfaces/naming-strategy.interface';
import { IFileMetadata } from '../interfaces/file-metadata.interface';
import { StorageProviderType, FileVisibility } from '../types/file.types';
import { FileValidationError } from '../errors/file.errors';
import { fileStorageConfig } from '../config/file.config';
import path from 'path';

/**
 * Enterprise File Service Orchestrator (Module 21.1 Clean Architecture Boundary).
 * 
 * Responsibilities (SRP):
 * 1. Validate file size and MIME type inputs.
 * 2. Delegate filename generation to INamingStrategy.
 * 3. Resolve target IStorageProvider via IStorageProviderFactory.
 * 4. Execute upload, replacement, deletion, and signed URL generation pipelines.
 * 5. Provide zero provider-specific driver leaks into application callers.
 */
export class FileService implements IFileService {
  constructor(
    private readonly providerFactory: IStorageProviderFactory,
    private readonly namingStrategy: INamingStrategy
  ) {}

  /**
   * Validates file upload size and MIME type.
   */
  private validateFile(file: Buffer, options: IFileUploadOptions): void {
    if (!file || file.length === 0) {
      throw new FileValidationError('File buffer payload cannot be empty');
    }

    if (file.length > fileStorageConfig.maxFileSizeBytes) {
      throw new FileValidationError(
        `File size (${file.length} bytes) exceeds maximum limit of ${fileStorageConfig.maxFileSizeBytes} bytes`
      );
    }

    if (options.mimeType && !fileStorageConfig.allowedMimeTypes.includes(options.mimeType)) {
      throw new FileValidationError(`MIME type '${options.mimeType}' is not allowed for upload`);
    }
  }

  /**
   * Validates, processes, and dispatches a file upload through the configured storage provider pipeline.
   */
  async uploadFile(file: Buffer, options: IFileUploadOptions): Promise<IFileMetadata> {
    this.validateFile(file, options);

    const generatedFilename = this.namingStrategy.generateName(
      options.originalFilename,
      options.namingStrategy || fileStorageConfig.defaultNamingStrategy,
      options.customPrefix
    );

    const ext = path.extname(options.originalFilename).replace('.', '').toLowerCase();
    const provider = this.providerFactory.getProvider(options.provider);

    const partialMetadata: Partial<IFileMetadata> = {
      filename: generatedFilename,
      originalFilename: options.originalFilename,
      mimeType: options.mimeType,
      extension: ext,
      size: file.length,
      category: options.category,
      uploadedBy: options.uploadedBy,
      folder: options.folder || options.category.toLowerCase(),
      visibility: options.visibility || fileStorageConfig.defaultVisibility,
    };

    return provider.upload(file, partialMetadata);
  }

  /**
   * Deletes an asset file from storage provider.
   */
  async deleteFile(pathOrKey: string, providerType?: StorageProviderType): Promise<boolean> {
    if (!pathOrKey || pathOrKey.trim().length === 0) {
      throw new FileValidationError('File path or key parameter is required for deletion');
    }

    const provider = this.providerFactory.getProvider(providerType);
    return provider.delete(pathOrKey);
  }

  /**
   * Replaces an existing asset file with a new file upload.
   */
  async replaceFile(
    oldPathOrKey: string,
    newFile: Buffer,
    options: IFileUploadOptions
  ): Promise<IFileMetadata> {
    const uploadedMetadata = await this.uploadFile(newFile, options);

    if (oldPathOrKey && oldPathOrKey.trim().length > 0) {
      try {
        await this.deleteFile(oldPathOrKey, options.provider);
      } catch (error) {
        console.warn(`[FileService] Warning: Failed to clean up old asset '${oldPathOrKey}':`, error);
      }
    }

    return uploadedMetadata;
  }

  /**
   * Generates a time-limited signed access URL for private assets.
   */
  async getSignedUrl(
    pathOrKey: string,
    expiresInSeconds: number = fileStorageConfig.signedUrlExpirationSeconds,
    providerType?: StorageProviderType
  ): Promise<string> {
    const provider = this.providerFactory.getProvider(providerType);
    return provider.getSignedUrl(pathOrKey, expiresInSeconds);
  }

  /**
   * Checks if an asset exists in storage.
   */
  async fileExists(pathOrKey: string, providerType?: StorageProviderType): Promise<boolean> {
    const provider = this.providerFactory.getProvider(providerType);
    return provider.exists(pathOrKey);
  }
}
