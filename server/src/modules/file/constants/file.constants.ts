import { StorageProviderType, FileVisibility, NamingStrategyType } from '../types/file.types';

/**
 * Enterprise File Upload Constants & Configuration Boundaries (Module 21.3).
 */

/**
 * Allowed File Extension Sets.
 */
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
export const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'];
export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi'];
export const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];
export const ARCHIVE_EXTENSIONS = ['.zip', '.tar', '.gz', '.7z'];

/**
 * Allowed Image MIME Types.
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

/**
 * Allowed Document MIME Types.
 */
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
];

/**
 * Allowed Video MIME Types.
 */
export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
];

/**
 * Allowed Audio MIME Types.
 */
export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
];

/**
 * Allowed Archive MIME Types.
 */
export const ALLOWED_ARCHIVE_MIME_TYPES = [
  'application/zip',
  'application/x-tar',
  'application/gzip',
  'application/x-7z-compressed',
];

/**
 * Combined Allowed Upload MIME Types.
 */
export const ALLOWED_UPLOAD_MIME_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  ...ALLOWED_DOCUMENT_MIME_TYPES,
  ...ALLOWED_VIDEO_MIME_TYPES,
  ...ALLOWED_AUDIO_MIME_TYPES,
  ...ALLOWED_ARCHIVE_MIME_TYPES,
];

/**
 * File Size Boundary Constants.
 */
export const FILE_LIMITS = {
  maxFileSizeBytes: 50 * 1024 * 1024, // 50MB
  maxImageSizeBytes: 10 * 1024 * 1024, // 10MB
  maxDocumentSizeBytes: 25 * 1024 * 1024, // 25MB
  maxVideoSizeBytes: 100 * 1024 * 1024, // 100MB
};

/**
 * Defaults & Validation Rules.
 */
export const MAX_FILENAME_LENGTH = 255;
export const MAX_TAGS_PER_FILE = 20;
export const MAX_FOLDER_PATH_LENGTH = 200;
export const SIGNED_URL_EXPIRY_DEFAULT = 3600; // 1 Hour

export const DEFAULT_UPLOAD_FOLDERS = {
  products: 'products',
  categories: 'categories',
  brands: 'brands',
  users: 'users/avatars',
  vendors: 'vendors/documents',
  invoices: 'invoices',
  orders: 'orders/attachments',
  returns: 'returns',
  system: 'system',
};

export const THUMBNAIL_SIZES = {
  small: { width: 150, height: 150 },
  medium: { width: 300, height: 300 },
  large: { width: 600, height: 600 },
};

export const CACHE_DURATIONS = {
  publicAssets: 31536000, // 1 year
  privateAssets: 0,
};

/**
 * Default Storage Provider Configuration Constants.
 */
export const DEFAULT_FILE_CONFIG = {
  provider: (process.env.STORAGE_PROVIDER as StorageProviderType) || StorageProviderType.LOCAL,
  visibility: FileVisibility.PUBLIC,
  namingStrategy: NamingStrategyType.UUID,
  cacheControl: 'public, max-age=31536000, immutable',
  signedUrlExpirationSeconds: SIGNED_URL_EXPIRY_DEFAULT,
  imageQuality: 85,
  overwrite: false,
};
