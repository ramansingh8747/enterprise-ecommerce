/**
 * Enterprise File Upload & Document Management Module Enums & Types (Module 21.2).
 */

/**
 * Storage Provider Identifier Enums.
 */
export enum StorageProviderType {
  LOCAL = 'LOCAL',
  CLOUDINARY = 'CLOUDINARY',
  AWS_S3 = 'AWS_S3',
  AZURE_BLOB = 'AZURE_BLOB',
  GCP_STORAGE = 'GCP_STORAGE',
  GCS = 'GCS',
  MOCK = 'MOCK',
}

/**
 * Access visibility control for stored assets.
 */
export enum FileVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  SIGNED_URL = 'SIGNED_URL',
}

/**
 * File upload lifecycle status state machine.
 */
export enum UploadStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
}

/**
 * Naming strategy algorithms for uploaded asset files.
 */
export enum NamingStrategyType {
  UUID = 'UUID',
  TIMESTAMP = 'TIMESTAMP',
  RANDOM_HASH = 'RANDOM_HASH',
  ORIGINAL = 'ORIGINAL',
  CUSTOM = 'CUSTOM',
}

/**
 * Application functional categories for asset classification.
 */
export enum FileCategory {
  PRODUCT_IMAGE = 'PRODUCT_IMAGE',
  PRODUCT_DOCUMENT = 'PRODUCT_DOCUMENT',
  BRAND_LOGO = 'BRAND_LOGO',
  CATEGORY_IMAGE = 'CATEGORY_IMAGE',
  PROFILE_PICTURE = 'PROFILE_PICTURE',
  VENDOR_DOCUMENT = 'VENDOR_DOCUMENT',
  RETURN_IMAGE = 'RETURN_IMAGE',
  INVOICE_PDF = 'INVOICE_PDF',
  ORDER_ATTACHMENT = 'ORDER_ATTACHMENT',
  ADMIN_UPLOAD = 'ADMIN_UPLOAD',
  SYSTEM = 'SYSTEM',
}

/**
 * Generic Owner Entity Target Classifications for polymorphic linking.
 */
export enum OwnerEntityType {
  PRODUCT = 'PRODUCT',
  USER = 'USER',
  BRAND = 'BRAND',
  CATEGORY = 'CATEGORY',
  ORDER = 'ORDER',
  REVIEW = 'REVIEW',
  RETURN_REQUEST = 'RETURN_REQUEST',
  VENDOR = 'VENDOR',
  SYSTEM = 'SYSTEM',
}
