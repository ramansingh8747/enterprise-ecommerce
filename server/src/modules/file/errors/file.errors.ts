/**
 * Enterprise File Upload & Storage Error Architecture (Module 21.1).
 * Custom typed domain errors for storage operations.
 */

/**
 * Base Abstract Storage Error class.
 */
export abstract class BaseStorageError extends Error {
  abstract readonly statusCode: number;
  constructor(message: string, public readonly code: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Storage Operation Failure Error.
 */
export class StorageError extends BaseStorageError {
  readonly statusCode = 500;
  constructor(message: string, code: string = 'STORAGE_ERROR') {
    super(message, code);
  }
}

/**
 * File Upload Execution Error.
 */
export class UploadError extends BaseStorageError {
  readonly statusCode = 500;
  constructor(message: string, code: string = 'UPLOAD_ERROR') {
    super(message, code);
  }
}

/**
 * File Deletion Execution Error.
 */
export class DeleteError extends BaseStorageError {
  readonly statusCode = 500;
  constructor(message: string, code: string = 'DELETE_ERROR') {
    super(message, code);
  }
}

/**
 * File Validation Error (size, mime type, dimensions).
 */
export class FileValidationError extends BaseStorageError {
  readonly statusCode = 400;
  constructor(message: string, code: string = 'FILE_VALIDATION_ERROR') {
    super(message, code);
  }
}

/**
 * Provider Unavailable / Unreachable Error.
 */
export class ProviderUnavailableError extends BaseStorageError {
  readonly statusCode = 503;
  constructor(message: string, code: string = 'PROVIDER_UNAVAILABLE_ERROR') {
    super(message, code);
  }
}

/**
 * Storage Configuration Error.
 */
export class FileConfigurationError extends BaseStorageError {
  readonly statusCode = 500;
  constructor(message: string, code: string = 'FILE_CONFIG_ERROR') {
    super(message, code);
  }
}
