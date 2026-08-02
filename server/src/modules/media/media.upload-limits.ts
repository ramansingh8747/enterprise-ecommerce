/**
 * Media upload limit configuration (Step 13.5).
 *
 * Values are read from environment with safe defaults.
 */

const parsePositiveInt = (
    value: string | undefined,
    fallback: number
): number => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    return Math.floor(parsed);
};

/**
 * Allowed image MIME types for Media uploads.
 */
export const MEDIA_ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
] as const;

/**
 * Allowed image file extensions (lowercase, without leading dot).
 */
export const MEDIA_ALLOWED_EXTENSIONS = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "avif",
] as const;

/**
 * MIME type prefixes that are always rejected for image uploads.
 */
export const MEDIA_REJECTED_MIME_PREFIXES = [
    "application/",
    "text/",
    "video/",
    "audio/",
] as const;

/**
 * Upload limits driven by environment variables.
 */
export const MEDIA_UPLOAD_LIMITS = {
    MAX_IMAGE_SIZE_MB: parsePositiveInt(process.env.MAX_IMAGE_SIZE_MB, 5),
    MAX_PRODUCT_IMAGES: parsePositiveInt(process.env.MAX_PRODUCT_IMAGES, 10),
    MAX_FILENAME_LENGTH: 255,
} as const;

/**
 * Derived byte limit for Multer and file-size validator.
 */
export const MEDIA_MAX_IMAGE_SIZE_BYTES =
    MEDIA_UPLOAD_LIMITS.MAX_IMAGE_SIZE_MB * 1024 * 1024;

/**
 * Validation error code used by Media validators.
 */
export const MEDIA_VALIDATION_FAILED_CODE = "MEDIA_VALIDATION_FAILED" as const;
