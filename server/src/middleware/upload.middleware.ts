import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

/**
 * Allowed image MIME types for product uploads.
 */
const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]);

/**
 * Maximum size per image: 5 MB.
 */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Cloudinary storage adapter for product images.
 */
const productImageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "enterprise-ecommerce/products",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        resource_type: "image",
    } as {
        folder: string;
        allowed_formats: string[];
        resource_type: string;
    },
});

/**
 * Rejects unsupported image formats before upload.
 */
const imageFileFilter = (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
): void => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
        callback(null, true);
        return;
    }

    callback(
        new Error(
            "Unsupported file format. Allowed formats: jpg, jpeg, png, webp."
        )
    );
};

/**
 * Multer instance configured for Cloudinary product uploads.
 */
const productUploader = multer({
    storage: productImageStorage,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
    },
    fileFilter: imageFileFilter,
});

/**
 * Cloudinary storage adapter for category images.
 * Reuses the shared Cloudinary config, MIME allow-list, and size limit.
 */
const categoryImageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "enterprise-ecommerce/categories",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        resource_type: "image",
    } as {
        folder: string;
        allowed_formats: string[];
        resource_type: string;
    },
});

/**
 * Multer instance configured for Cloudinary category uploads.
 */
const categoryUploader = multer({
    storage: categoryImageStorage,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
    },
    fileFilter: imageFileFilter,
});

/**
 * Allowed MIME types for brand logo uploads (includes SVG).
 * Product/Category allow-lists remain unchanged.
 */
const BRAND_ALLOWED_MIME_TYPES = new Set([
    ...ALLOWED_MIME_TYPES,
    "image/svg+xml",
]);

/**
 * Cloudinary storage adapter for brand logos.
 * Reuses the shared Cloudinary config and size limit.
 */
const brandLogoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "enterprise-ecommerce/brands",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
        resource_type: "image",
    } as {
        folder: string;
        allowed_formats: string[];
        resource_type: string;
    },
});

/**
 * Rejects unsupported brand logo formats before upload.
 */
const brandLogoFileFilter = (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
): void => {
    if (BRAND_ALLOWED_MIME_TYPES.has(file.mimetype)) {
        callback(null, true);
        return;
    }

    callback(
        new Error(
            "Unsupported file format. Allowed formats: jpg, jpeg, png, webp, svg."
        )
    );
};

/**
 * Multer instance configured for Cloudinary brand logo uploads.
 */
const brandUploader = multer({
    storage: brandLogoStorage,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
    },
    fileFilter: brandLogoFileFilter,
});

/**
 * Product image upload middleware.
 *
 * Fields:
 * - thumbnail → single image
 * - images → up to 10 images
 *
 * Uploads to Cloudinary; attaches file metadata (including URL in `path`) to `req.files`.
 */
export const uploadProductImages = productUploader.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
]);

/**
 * Category image upload middleware.
 *
 * Field:
 * - image → single image
 *
 * Uploads to Cloudinary; attaches file metadata (including URL in `path`) to `req.file`.
 */
export const uploadCategoryImage = categoryUploader.single("image");

/**
 * Brand logo upload middleware.
 *
 * Field:
 * - logo → single image (jpg, jpeg, png, webp, svg)
 *
 * Uploads to Cloudinary; attaches file metadata (including URL in `path`) to `req.file`.
 */
export const uploadBrandLogo = brandUploader.single("logo");
