import multer, { StorageEngine, FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_DOCUMENT_MIME_TYPES,
  IMAGE_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  FILE_LIMITS,
} from '../constants/file.constants';
import { FileValidationError } from '../errors/file.errors';

/**
 * Upload Middleware Options Specification (Module 21.4).
 */
export interface IUploadMiddlewareOptions {
  maxFileSizeBytes?: number;
  maxFileCount?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  storageMode?: 'memory' | 'disk';
  destination?: string;
  mode?: 'image-only' | 'document-only' | 'all';
}

/**
 * Dangerous executable & script file extension blacklist.
 */
export const DANGEROUS_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.php',
  '.js',
  '.vbs',
  '.dll',
  '.ps1',
  '.scr',
  '.jar',
  '.py',
];

/**
 * Windows reserved filenames blacklist.
 */
export const RESERVED_FILENAMES = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'LPT1', 'CLOCK$'];

/**
 * Enterprise Multer Engine Builder Factory (Module 21.4).
 */
export class MulterConfigBuilder {
  /**
   * Constructs storage engine based on requested mode (memoryStorage vs diskStorage).
   */
  private static createStorageEngine(options: IUploadMiddlewareOptions): StorageEngine {
    if (options.storageMode === 'disk') {
      const destDir = options.destination || './uploads/temp';
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      return multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, destDir),
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          const uniqueName = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
          cb(null, uniqueName);
        },
      });
    }

    // Default: Memory storage for streaming to storage providers
    return multer.memoryStorage();
  }

  /**
   * Evaluates allowed MIME list based on requested upload mode.
   */
  private static resolveAllowedMimeTypes(options: IUploadMiddlewareOptions): string[] {
    if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
      return options.allowedMimeTypes;
    }

    if (options.mode === 'image-only') {
      return ALLOWED_IMAGE_MIME_TYPES;
    }

    if (options.mode === 'document-only') {
      return ALLOWED_DOCUMENT_MIME_TYPES;
    }

    return ALLOWED_UPLOAD_MIME_TYPES;
  }

  /**
   * Evaluates allowed extensions based on mode.
   */
  private static resolveAllowedExtensions(options: IUploadMiddlewareOptions): string[] {
    if (options.allowedExtensions && options.allowedExtensions.length > 0) {
      return options.allowedExtensions.map((ext) => (ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`));
    }

    if (options.mode === 'image-only') {
      return IMAGE_EXTENSIONS;
    }

    if (options.mode === 'document-only') {
      return DOCUMENT_EXTENSIONS;
    }

    return [...IMAGE_EXTENSIONS, ...DOCUMENT_EXTENSIONS];
  }

  /**
   * Pre-validation filter inspecting MIME type, extensions, reserved names, and empty files.
   */
  private static createFileFilter(options: IUploadMiddlewareOptions) {
    const allowedMimeTypes = this.resolveAllowedMimeTypes(options);
    const allowedExtensions = this.resolveAllowedExtensions(options);

    return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.originalname, ext).toUpperCase();

      // 1. Dangerous Extension Check
      if (DANGEROUS_EXTENSIONS.includes(ext)) {
        return cb(new FileValidationError(`Security Warning: Executable extension '${ext}' is strictly forbidden`));
      }

      // 2. Reserved Filename Check
      if (RESERVED_FILENAMES.includes(baseName)) {
        return cb(new FileValidationError(`Security Warning: Reserved filename '${file.originalname}' is not allowed`));
      }

      // 3. MIME Type Check
      if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
        return cb(
          new FileValidationError(
            `Unsupported file MIME type '${file.mimetype}'. Allowed types: ${allowedMimeTypes.join(', ')}`
          )
        );
      }

      // 4. Extension Check
      if (!allowedExtensions.includes(ext)) {
        return cb(
          new FileValidationError(
            `Unsupported file extension '${ext}'. Allowed extensions: ${allowedExtensions.join(', ')}`
          )
        );
      }

      cb(null, true);
    };
  }

  /**
   * Instantiates a configured Multer middleware instance.
   */
  static build(options: IUploadMiddlewareOptions = {}): multer.Multer {
    const storage = this.createStorageEngine(options);
    const fileFilter = this.createFileFilter(options);

    const limits: multer.Options['limits'] = {
      fileSize: options.maxFileSizeBytes || FILE_LIMITS.maxFileSizeBytes,
      files: options.maxFileCount || 10,
    };

    return multer({
      storage,
      fileFilter,
      limits,
    });
  }
}
