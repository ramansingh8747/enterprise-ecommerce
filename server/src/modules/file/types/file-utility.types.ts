import {
  StorageProviderType,
  FileVisibility,
  UploadStatus,
  FileCategory,
  OwnerEntityType,
  NamingStrategyType,
} from './file.types';

/**
 * Reusable Utility Types for File Operations (Module 21.3).
 */

/**
 * Generic key-value metadata map type.
 */
export type FileMetadataMap = Record<string, unknown>;

/**
 * Upload configuration settings utility type.
 */
export interface FileUploadConfig {
  category: FileCategory;
  visibility?: FileVisibility;
  folder?: string;
  provider?: StorageProviderType;
  namingStrategy?: NamingStrategyType;
  customPrefix?: string;
  overwrite?: boolean;
}

/**
 * Query filter parameters utility type for listing file assets.
 */
export interface FileQueryFilter {
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
  startDate?: Date;
  endDate?: Date;
  isDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination configuration utility type.
 */
export interface FilePaginationOptions {
  page: number;
  limit: number;
}

/**
 * Sorting configuration options.
 */
export interface FileSortOptions {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
