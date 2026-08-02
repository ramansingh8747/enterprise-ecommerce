import { StorageProviderType, FileVisibility, FileCategory } from '../types/file.types';

/**
 * Universal File Metadata Model (Module 21.5).
 */
export interface IFileMetadata {
  /**
   * Stored unique filename key.
   */
  filename: string;

  /**
   * Original client filename prior to upload.
   */
  originalFilename: string;

  /**
   * Stored unique filename key alias.
   */
  storedFilename?: string;

  /**
   * MIME content type (e.g., 'image/png', 'application/pdf').
   */
  mimeType: string;

  /**
   * File extension (e.g., 'png', 'pdf').
   */
  extension: string;

  /**
   * File size in bytes.
   */
  size: number;

  /**
   * Optional MD5/SHA256 checksum hash for integrity checks.
   */
  checksum?: string;

  /**
   * Image width pixel dimension (if applicable).
   */
  width?: number;

  /**
   * Image height pixel dimension (if applicable).
   */
  height?: number;

  /**
   * Functional application category classification.
   */
  category: FileCategory;

  /**
   * User ID of account uploading the asset.
   */
  uploadedBy?: string;

  /**
   * UTC timestamp when file was uploaded.
   */
  uploadedAt: Date;

  /**
   * Vendor storage provider handling asset.
   */
  provider: StorageProviderType;

  /**
   * Cloud bucket or container identifier (if applicable).
   */
  bucket?: string;

  /**
   * Sub-folder directory path key.
   */
  folder?: string;

  /**
   * Access visibility level (PUBLIC / PRIVATE / SIGNED_URL).
   */
  visibility: FileVisibility;

  /**
   * Public CDN or relative web URL.
   */
  url?: string;

  /**
   * Overwrite flag for upload strategy.
   */
  overwrite?: boolean;
}
