import {
  FileCategory,
  FileVisibility,
  NamingStrategyType,
  OwnerEntityType,
  StorageProviderType,
  UploadStatus,
} from '../types/file.types';

/**
 * Upload File Request DTO specification.
 */
export interface UploadFileDto {
  category: FileCategory;
  visibility?: FileVisibility;
  folder?: string;
  tags?: string[];
  ownerType?: OwnerEntityType | string;
  ownerId?: string;
  provider?: StorageProviderType;
  namingStrategy?: NamingStrategyType;
  customPrefix?: string;
  overwrite?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Replace File Request DTO specification.
 */
export interface ReplaceFileDto {
  fileId: string;
  category: FileCategory;
  visibility?: FileVisibility;
  folder?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Update File Metadata DTO specification.
 */
export interface UpdateFileMetadataDto {
  tags?: string[];
  visibility?: FileVisibility;
  category?: FileCategory;
  metadata?: Record<string, unknown>;
  ownerType?: OwnerEntityType | string;
  ownerId?: string;
}

/**
 * Move File Request DTO specification.
 */
export interface MoveFileDto {
  sourceKey: string;
  destKey: string;
}

/**
 * Copy File Request DTO specification.
 */
export interface CopyFileDto {
  sourceKey: string;
  destKey: string;
}

/**
 * Generate Signed URL DTO specification.
 */
export interface GenerateSignedUrlDto {
  pathOrKey: string;
  expiresInSeconds?: number;
  provider?: StorageProviderType;
}

/**
 * List Files Query Request DTO specification.
 */
export interface ListFilesQueryDto {
  page?: number;
  limit?: number;
  provider?: StorageProviderType;
  uploadStatus?: UploadStatus;
  visibility?: FileVisibility;
  category?: FileCategory;
  uploadedBy?: string;
  ownerType?: OwnerEntityType | string;
  ownerId?: string;
  folder?: string;
  tags?: string[];
  mimeType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
