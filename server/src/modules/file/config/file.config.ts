import { StorageProviderType, FileVisibility, NamingStrategyType } from '../types/file.types';
import { DEFAULT_FILE_CONFIG, FILE_LIMITS, ALLOWED_UPLOAD_MIME_TYPES } from '../constants/file.constants';

/**
 * Storage Vendor Provider Configuration Settings.
 */
export interface IProviderConfig {
  localStoragePath?: string;
  cloudinary?: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  awsS3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  azureBlob?: {
    containerName: string;
    connectionString: string;
  };
  gcs?: {
    bucket: string;
    keyFilename: string;
  };
}

/**
 * Universal File Storage Configuration Architecture.
 */
export interface IFileStorageConfig {
  defaultProvider: StorageProviderType;
  defaultVisibility: FileVisibility;
  defaultNamingStrategy: NamingStrategyType;
  maxFileSizeBytes: number;
  maxImageSizeBytes: number;
  allowedMimeTypes: string[];
  cacheControl: string;
  signedUrlExpirationSeconds: number;
  imageQuality: number;
  overwritePolicy: boolean;
  providers: IProviderConfig;
}

/**
 * Active File Storage Configuration Instance.
 */
export const fileStorageConfig: IFileStorageConfig = {
  defaultProvider: DEFAULT_FILE_CONFIG.provider,
  defaultVisibility: DEFAULT_FILE_CONFIG.visibility,
  defaultNamingStrategy: DEFAULT_FILE_CONFIG.namingStrategy,
  maxFileSizeBytes: FILE_LIMITS.maxFileSizeBytes,
  maxImageSizeBytes: FILE_LIMITS.maxImageSizeBytes,
  allowedMimeTypes: ALLOWED_UPLOAD_MIME_TYPES,
  cacheControl: DEFAULT_FILE_CONFIG.cacheControl,
  signedUrlExpirationSeconds: DEFAULT_FILE_CONFIG.signedUrlExpirationSeconds,
  imageQuality: DEFAULT_FILE_CONFIG.imageQuality,
  overwritePolicy: DEFAULT_FILE_CONFIG.overwrite,
  providers: {
    localStoragePath: process.env.LOCAL_STORAGE_PATH || './uploads',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
    awsS3: {
      bucket: process.env.AWS_S3_BUCKET || '',
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    azureBlob: {
      containerName: process.env.AZURE_CONTAINER_NAME || '',
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    },
    gcs: {
      bucket: process.env.GCS_BUCKET || '',
      keyFilename: process.env.GCS_KEY_FILE || '',
    },
  },
};
