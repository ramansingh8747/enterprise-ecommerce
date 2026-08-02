import { Router } from 'express';
import { fileController } from '../../../container';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize, ROLES } from '../../../middleware/role.middleware';
import { UploadMiddleware } from '../middleware/upload.middleware';
import {
  uploadFileValidation,
  replaceFileValidation,
  getFileByIdValidation,
  deleteFileValidation,
  restoreFileValidation,
  updateFileMetadataValidation,
  moveFileValidation,
  copyFileValidation,
  generateSignedUrlValidation,
  listFilesQueryValidation,
} from '../validations/file.validation';

const router = Router();

// Require JWT Authentication for all file operations
router.use(authenticate);

/**
 * Single File Upload Endpoint.
 * POST /api/v1/files/upload
 */
router.post(
  '/upload',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR, ROLES.CUSTOMER),
  UploadMiddleware.single('file'),
  uploadFileValidation,
  fileController.uploadSingleFile
);

/**
 * Multiple Files Upload Endpoint.
 * POST /api/v1/files/upload/multiple
 */
router.post(
  '/upload/multiple',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR, ROLES.CUSTOMER),
  UploadMiddleware.array('files', 10),
  uploadFileValidation,
  fileController.uploadMultipleFiles
);

/**
 * Replace File Endpoint.
 * PUT /api/v1/files/:id/replace
 */
router.put(
  '/:id/replace',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR, ROLES.CUSTOMER),
  UploadMiddleware.single('file'),
  replaceFileValidation,
  fileController.replaceFile
);

/**
 * Update File Metadata Endpoint.
 * PATCH /api/v1/files/:id/metadata
 */
router.patch(
  '/:id/metadata',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR, ROLES.CUSTOMER),
  updateFileMetadataValidation,
  fileController.updateFileMetadata
);

/**
 * Move File Endpoint.
 * PATCH /api/v1/files/:id/move
 */
router.patch(
  '/:id/move',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  moveFileValidation,
  fileController.moveFile
);

/**
 * Copy File Endpoint.
 * POST /api/v1/files/:id/copy
 */
router.post(
  '/:id/copy',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  copyFileValidation,
  fileController.copyFile
);

/**
 * Delete File Endpoint (Soft or Permanent).
 * DELETE /api/v1/files/:id
 */
router.delete(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDOR, ROLES.CUSTOMER),
  deleteFileValidation,
  fileController.deleteFile
);

/**
 * Restore Soft-Deleted File Endpoint.
 * PATCH /api/v1/files/:id/restore
 */
router.patch(
  '/:id/restore',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  restoreFileValidation,
  fileController.restoreFile
);

/**
 * Get File Public URL Endpoint.
 * GET /api/v1/files/:id/public-url
 */
router.get(
  '/:id/public-url',
  getFileByIdValidation,
  fileController.getPublicUrl
);

/**
 * Generate Time-Limited Signed URL Endpoint.
 * GET /api/v1/files/:id/signed-url
 */
router.get(
  '/:id/signed-url',
  generateSignedUrlValidation,
  fileController.generateSignedUrl
);

/**
 * Get File Metadata by ID Endpoint.
 * GET /api/v1/files/:id
 */
router.get(
  '/:id',
  getFileByIdValidation,
  fileController.getFileById
);

/**
 * List Files with Pagination, Filtering & Sorting Endpoint.
 * GET /api/v1/files
 */
router.get(
  '/',
  listFilesQueryValidation,
  fileController.listFiles
);

export default router;
