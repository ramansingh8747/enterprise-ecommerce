import { body, param, query } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';
import {
  FileCategory,
  FileVisibility,
  NamingStrategyType,
  OwnerEntityType,
  StorageProviderType,
  UploadStatus,
} from '../types/file.types';

/**
 * Express-validator chain for upload metadata fields.
 */
export const uploadFileValidation = [
  body('category')
    .notEmpty()
    .withMessage('File category is required')
    .isIn(Object.values(FileCategory))
    .withMessage('Invalid file category'),
  body('visibility')
    .optional()
    .isIn(Object.values(FileVisibility))
    .withMessage('Invalid file visibility level'),
  body('folder')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Folder path cannot exceed 200 characters'),
  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Tags must be an array of maximum 20 string tags'),
  body('ownerType')
    .optional()
    .isIn(Object.values(OwnerEntityType))
    .withMessage('Invalid owner entity type'),
  body('ownerId')
    .optional()
    .isMongoId()
    .withMessage('ownerId must be a valid Mongo ObjectId'),
  body('provider')
    .optional()
    .isIn(Object.values(StorageProviderType))
    .withMessage('Invalid storage provider'),
  body('namingStrategy')
    .optional()
    .isIn(Object.values(NamingStrategyType))
    .withMessage('Invalid naming strategy'),
  body('overwrite')
    .optional()
    .isBoolean()
    .withMessage('overwrite must be a boolean value'),
  validateRequest,
];

/**
 * Express-validator chain for replacing an existing file.
 */
export const replaceFileValidation = [
  param('id')
    .notEmpty()
    .withMessage('File ID path parameter is required')
    .isMongoId()
    .withMessage('File ID must be a valid Mongo ObjectId'),
  body('category')
    .optional()
    .isIn(Object.values(FileCategory))
    .withMessage('Invalid file category'),
  body('visibility')
    .optional()
    .isIn(Object.values(FileVisibility))
    .withMessage('Invalid file visibility level'),
  validateRequest,
];

/**
 * Express-validator chain for path parameter ID lookups.
 */
export const getFileByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('File ID path parameter is required')
    .isMongoId()
    .withMessage('File ID must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for deleting a file.
 */
export const deleteFileValidation = [
  param('id')
    .notEmpty()
    .withMessage('File ID path parameter is required')
    .isMongoId()
    .withMessage('File ID must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for restoring a soft-deleted file.
 */
export const restoreFileValidation = [
  param('id')
    .notEmpty()
    .withMessage('File ID path parameter is required')
    .isMongoId()
    .withMessage('File ID must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for updating file metadata.
 */
export const updateFileMetadataValidation = [
  param('id')
    .notEmpty()
    .withMessage('File ID path parameter is required')
    .isMongoId()
    .withMessage('File ID must be a valid Mongo ObjectId'),
  body('visibility')
    .optional()
    .isIn(Object.values(FileVisibility))
    .withMessage('Invalid file visibility level'),
  body('category')
    .optional()
    .isIn(Object.values(FileCategory))
    .withMessage('Invalid file category'),
  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Tags must be an array of maximum 20 string tags'),
  body('ownerType')
    .optional()
    .isIn(Object.values(OwnerEntityType))
    .withMessage('Invalid owner entity type'),
  body('ownerId')
    .optional()
    .isMongoId()
    .withMessage('ownerId must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for moving a stored asset.
 */
export const moveFileValidation = [
  body('sourceKey')
    .notEmpty()
    .withMessage('sourceKey is required')
    .isString()
    .trim(),
  body('destKey')
    .notEmpty()
    .withMessage('destKey is required')
    .isString()
    .trim(),
  validateRequest,
];

/**
 * Express-validator chain for copying a stored asset.
 */
export const copyFileValidation = [
  body('sourceKey')
    .notEmpty()
    .withMessage('sourceKey is required')
    .isString()
    .trim(),
  body('destKey')
    .notEmpty()
    .withMessage('destKey is required')
    .isString()
    .trim(),
  validateRequest,
];

/**
 * Express-validator chain for generating signed URLs.
 */
export const generateSignedUrlValidation = [
  query('expiresInSeconds')
    .optional()
    .isInt({ min: 1, max: 604800 })
    .withMessage('expiresInSeconds must be an integer between 1 and 604800 (7 days)'),
  validateRequest,
];

/**
 * Express-validator chain for query listing files.
 */
export const listFilesQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),
  query('provider')
    .optional()
    .isIn(Object.values(StorageProviderType))
    .withMessage('Invalid storage provider filter'),
  query('uploadStatus')
    .optional()
    .isIn(Object.values(UploadStatus))
    .withMessage('Invalid upload status filter'),
  query('visibility')
    .optional()
    .isIn(Object.values(FileVisibility))
    .withMessage('Invalid file visibility filter'),
  query('category')
    .optional()
    .isIn(Object.values(FileCategory))
    .withMessage('Invalid file category filter'),
  query('ownerType')
    .optional()
    .isIn(Object.values(OwnerEntityType))
    .withMessage('Invalid owner entity type filter'),
  query('ownerId')
    .optional()
    .isMongoId()
    .withMessage('ownerId must be a valid Mongo ObjectId'),
  query('uploadedBy')
    .optional()
    .isMongoId()
    .withMessage('uploadedBy must be a valid Mongo ObjectId'),
  query('sortBy')
    .optional()
    .isString()
    .trim(),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),
  validateRequest,
];
