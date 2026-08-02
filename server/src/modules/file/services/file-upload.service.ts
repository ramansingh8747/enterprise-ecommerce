import { IStorageProviderFactory } from '../interfaces/storage-factory.interface';
import { INamingStrategy } from '../interfaces/naming-strategy.interface';
import { IFileRepository } from '../interfaces/file-repository.interface';
import { IFile } from '../models/file.model';
import {
  UploadFileDto,
  ReplaceFileDto,
  UpdateFileMetadataDto,
  MoveFileDto,
  CopyFileDto,
  ListFilesQueryDto,
} from '../dto/file.dto';
import {
  FileCategory,
  FileVisibility,
  StorageProviderType,
  UploadStatus,
} from '../types/file.types';
import { StorageError, UploadError, FileValidationError } from '../errors/file.errors';
import { IFileMetadata } from '../interfaces/file-metadata.interface';
import { Types } from 'mongoose';
import path from 'path';

/**
 * Enterprise File Upload & Lifecycle Management Service (Module 21.6).
 * 
 * Provider-independent business service orchestrating:
 * 1. Single and batch file uploads with transactional database rollback logic.
 * 2. Safe file replacement with orphan asset cleanup.
 * 3. Soft and permanent deletions.
 * 4. Key manipulations (Move / Copy).
 * 5. Metadata updates & polymorphic owner reassignments.
 * 6. Time-limited signed URL generation.
 */
export class FileUploadService {
  constructor(
    private readonly providerFactory: IStorageProviderFactory,
    private readonly namingStrategy: INamingStrategy,
    private readonly fileRepository: IFileRepository
  ) {}

  /**
   * Validates file upload payload preconditions.
   */
  private validateUploadFile(file: Express.Multer.File): void {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new FileValidationError('Upload file buffer cannot be empty');
    }
  }

  /**
   * Uploads a single file, handles provider strategy handoff, and persists metadata in database.
   * Includes transactional rollback to delete physical asset if DB persistence fails.
   */
  async uploadFile(
    file: Express.Multer.File,
    dto: UploadFileDto,
    userId?: string
  ): Promise<IFile> {
    this.validateUploadFile(file);

    const providerType = dto.provider || StorageProviderType.LOCAL;
    const provider = this.providerFactory.getProvider(providerType);

    const storedFilename = this.namingStrategy.generateName(
      file.originalname,
      dto.namingStrategy,
      dto.customPrefix
    );

    const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
    const folder = dto.folder || (dto.category ? dto.category.toLowerCase() : 'general');

    const partialMetadata: Partial<IFileMetadata> = {
      filename: storedFilename,
      originalFilename: file.originalname,
      storedFilename,
      extension: ext,
      mimeType: file.mimetype.toLowerCase(),
      size: file.buffer.length,
      category: dto.category || FileCategory.SYSTEM,
      uploadedBy: userId,
      folder,
      visibility: dto.visibility || FileVisibility.PUBLIC,
      overwrite: dto.overwrite,
    };

    // Step 1: Physical Upload via Provider Strategy
    let uploadedMetadata: IFileMetadata;
    try {
      uploadedMetadata = await provider.upload(file.buffer, partialMetadata);
    } catch (error: any) {
      throw new UploadError(`Provider upload failed: ${error.message}`);
    }

    // Step 2: Database Document Persistence with Rollback Strategy
    try {
      const ownerRef =
        dto.ownerType && dto.ownerId && Types.ObjectId.isValid(dto.ownerId)
          ? {
              entityType: dto.ownerType,
              entityId: new Types.ObjectId(dto.ownerId),
            }
          : undefined;

      const fileDocumentData: Partial<IFile> = {
        filename: storedFilename,
        originalFilename: file.originalname,
        storedFilename,
        extension: ext,
        mimeType: file.mimetype.toLowerCase(),
        size: file.buffer.length,
        category: dto.category || FileCategory.SYSTEM,
        provider: providerType,
        bucket: uploadedMetadata.bucket,
        folder,
        url: uploadedMetadata.url,
        visibility: dto.visibility || FileVisibility.PUBLIC,
        uploadStatus: UploadStatus.COMPLETED,
        uploadedBy: userId ? new Types.ObjectId(userId) : undefined,
        uploadedAt: new Date(),
        owner: ownerRef,
        tags: dto.tags || [],
        metadata: dto.metadata || {},
        isDeleted: false,
      };

      return await this.fileRepository.create(fileDocumentData);
    } catch (dbError: any) {
      // ROLLBACK: Delete physical asset if DB persistence fails to avoid orphan files
      try {
        await provider.delete(storedFilename);
      } catch (rollbackError: any) {
        console.error(
          `[FileUploadService] CRITICAL ROLLBACK FAILURE: Could not delete orphan asset '${storedFilename}':`,
          rollbackError.message
        );
      }
      throw new StorageError(`Database metadata persistence failed: ${dbError.message}`);
    }
  }

  /**
   * Uploads multiple files in batch with partial success handling.
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    dto: UploadFileDto,
    userId?: string
  ): Promise<{
    success: IFile[];
    failed: { filename: string; error: string }[];
  }> {
    if (!Array.isArray(files) || files.length === 0) {
      return { success: [], failed: [] };
    }

    const success: IFile[] = [];
    const failed: { filename: string; error: string }[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, dto, userId);
        success.push(result);
      } catch (error: any) {
        failed.push({
          filename: file.originalname,
          error: error.message || 'Batch upload item failed',
        });
      }
    }

    return { success, failed };
  }

  /**
   * Replaces an existing file asset safely.
   */
  async replaceFile(
    fileId: string,
    newFile: Express.Multer.File,
    dto?: Partial<UploadFileDto>,
    userId?: string
  ): Promise<IFile> {
    const existingFile = await this.fileRepository.findById(fileId);
    if (!existingFile || existingFile.isDeleted) {
      throw new StorageError(`File asset with ID '${fileId}' not found or deleted`);
    }

    const mergedDto: UploadFileDto = {
      category: dto?.category || existingFile.category,
      visibility: dto?.visibility || existingFile.visibility,
      folder: dto?.folder || existingFile.folder,
      tags: dto?.tags || existingFile.tags,
      provider: dto?.provider || existingFile.provider,
      metadata: dto?.metadata || existingFile.metadata,
      ownerType: dto?.ownerType || (existingFile.owner?.entityType as any),
      ownerId: dto?.ownerId || existingFile.owner?.entityId.toString(),
    };

    // Step 1: Upload new replacement file
    const newlyUploadedFile = await this.uploadFile(newFile, mergedDto, userId);

    // Step 2: Clean up old physical file asset safely
    try {
      const oldProvider = this.providerFactory.getProvider(existingFile.provider);
      await oldProvider.delete(existingFile.storedFilename || existingFile.filename);
    } catch (oldDeleteError: any) {
      console.warn(
        `[FileUploadService] Warning: Failed to clean up replaced physical asset '${existingFile.storedFilename}':`,
        oldDeleteError.message
      );
    }

    // Step 3: Soft-delete old record
    await this.fileRepository.softDelete(fileId);

    return newlyUploadedFile;
  }

  /**
   * Deletes a file asset (Soft delete by default, physical permanent delete if requested).
   */
  async deleteFile(fileId: string, permanent: boolean = false, userId?: string): Promise<boolean> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) {
      return false;
    }

    if (permanent) {
      // Permanent physical file deletion
      try {
        const provider = this.providerFactory.getProvider(file.provider);
        await provider.delete(file.storedFilename || file.filename);
      } catch (providerError: any) {
        console.warn(
          `[FileUploadService] Warning: Permanent physical deletion failed for '${file.filename}':`,
          providerError.message
        );
      }
      return this.fileRepository.hardDelete(fileId);
    }

    // Soft delete in database
    const updated = await this.fileRepository.softDelete(fileId);
    return !!updated;
  }

  /**
   * Restores a soft-deleted file record.
   */
  async restoreFile(fileId: string, userId?: string): Promise<IFile> {
    const restored = await this.fileRepository.restore(fileId);
    if (!restored) {
      throw new StorageError(`File asset with ID '${fileId}' not found to restore`);
    }
    return restored;
  }

  /**
   * Retrieves a file record by ID.
   */
  async getFileById(fileId: string): Promise<IFile> {
    const file = await this.fileRepository.findById(fileId);
    if (!file || file.isDeleted) {
      throw new StorageError(`File asset with ID '${fileId}' not found`);
    }
    return file;
  }

  /**
   * Lists files with pagination, filtering, and sorting.
   */
  async listFiles(query: ListFilesQueryDto): Promise<{
    files: IFile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.fileRepository.find(query);
  }

  /**
   * Moves a file asset to a new key/folder.
   */
  async moveFile(fileId: string, dto: MoveFileDto): Promise<IFile> {
    const file = await this.getFileById(fileId);
    const provider = this.providerFactory.getProvider(file.provider);

    await provider.move(dto.sourceKey, dto.destKey);
    const updated = await this.fileRepository.update(fileId, {
      storedFilename: dto.destKey,
      folder: path.dirname(dto.destKey),
    });

    if (!updated) {
      throw new StorageError(`Failed to update metadata for moved file '${fileId}'`);
    }
    return updated;
  }

  /**
   * Copies a file asset to a new key.
   */
  async copyFile(fileId: string, dto: CopyFileDto): Promise<IFile> {
    const file = await this.getFileById(fileId);
    const provider = this.providerFactory.getProvider(file.provider);

    await provider.copy(dto.sourceKey, dto.destKey);

    const newFileData: Partial<IFile> = {
      ...file.toObject(),
      _id: undefined,
      filename: path.basename(dto.destKey),
      storedFilename: dto.destKey,
      folder: path.dirname(dto.destKey),
      createdAt: undefined,
      updatedAt: undefined,
    };

    return this.fileRepository.create(newFileData);
  }

  /**
   * Updates file metadata, tags, visibility, or owner reference.
   */
  async updateMetadata(fileId: string, dto: UpdateFileMetadataDto): Promise<IFile> {
    const file = await this.getFileById(fileId);

    const updatePayload: Partial<IFile> = {};
    if (dto.tags) updatePayload.tags = dto.tags;
    if (dto.visibility) updatePayload.visibility = dto.visibility;
    if (dto.category) updatePayload.category = dto.category;
    if (dto.metadata) updatePayload.metadata = { ...file.metadata, ...dto.metadata };

    if (dto.ownerType && dto.ownerId && Types.ObjectId.isValid(dto.ownerId)) {
      updatePayload.owner = {
        entityType: dto.ownerType,
        entityId: new Types.ObjectId(dto.ownerId),
      };
    }

    const updated = await this.fileRepository.update(fileId, updatePayload);
    if (!updated) {
      throw new StorageError(`Failed to update metadata for file '${fileId}'`);
    }
    return updated;
  }

  /**
   * Generates a time-limited signed access URL for private files.
   */
  async generateSignedUrl(fileId: string, expiresInSeconds: number = 3600): Promise<string> {
    const file = await this.getFileById(fileId);
    const provider = this.providerFactory.getProvider(file.provider);
    return provider.getSignedUrl(file.storedFilename || file.filename, expiresInSeconds);
  }

  /**
   * Returns the public URL of a file.
   */
  async getPublicUrl(fileId: string): Promise<string> {
    const file = await this.getFileById(fileId);
    return file.url || `/uploads/${file.storedFilename || file.filename}`;
  }
}
