/**
 * Media Multer middleware — memory storage only (Steps 13.2 / 13.5).
 *
 * Captures multipart files into `req.file` / `req.files` buffers.
 * File-size ceiling follows MAX_IMAGE_SIZE_MB (see media.upload-limits).
 * Does not upload to Cloudinary; CloudinaryProvider handles that later.
 * Not registered on any route in this step.
 */

import multer from "multer";
import {
    MEDIA_MAX_IMAGE_SIZE_BYTES,
    MEDIA_UPLOAD_LIMITS,
} from "../media.upload-limits";

/**
 * In-memory storage — no disk writes.
 */
const memoryStorage = multer.memoryStorage();

/**
 * Base Multer instance for Media uploads (memory only).
 */
const mediaUploader = multer({
    storage: memoryStorage,
    limits: {
        fileSize: MEDIA_MAX_IMAGE_SIZE_BYTES,
    },
});

/**
 * Single-file middleware. Field name: `file`.
 */
export const uploadSingleMedia = mediaUploader.single("file");

/**
 * Single-file middleware. Field name: `image` (Product media replace — Step 13.9).
 */
export const uploadReplaceMediaImage = mediaUploader.single("image");

/**
 * Multi-file middleware. Field name: `images` (Product media upload — Step 13.7).
 * Max count follows MAX_PRODUCT_IMAGES from environment.
 */
export const uploadProductMediaImages = mediaUploader.array(
    "images",
    MEDIA_UPLOAD_LIMITS.MAX_PRODUCT_IMAGES
);

/**
 * Multi-file middleware. Field name: `files`.
 * Max count follows MAX_PRODUCT_IMAGES from environment.
 */
export const uploadMultipleMedia = mediaUploader.array(
    "files",
    MEDIA_UPLOAD_LIMITS.MAX_PRODUCT_IMAGES
);

/**
 * Raw Multer instance for custom field configurations in later steps.
 */
export const mediaMulter = mediaUploader;
