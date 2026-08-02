/**
 * Enterprise Media Module shared types / enums (Step 13.3).
 *
 * Enum string values match MongoDB schema validation (lowercase).
 */

/**
 * Owner aggregates that may attach media in future steps.
 * Module 13 persists Product media via `productId` on the Media document.
 */
export enum MediaOwnerType {
    PRODUCT = "PRODUCT",
    VARIANT = "VARIANT",
    CATEGORY = "CATEGORY",
    BRAND = "BRAND",
    USER = "USER",
}

/**
 * Supported media kinds (image now; video / document later).
 */
export enum MediaType {
    IMAGE = "image",
    VIDEO = "video",
    DOCUMENT = "document",
}

/**
 * @deprecated Prefer MediaType — kept as an alias for Step 13.1/13.2 imports.
 */
export const MediaResourceType = MediaType;
export type MediaResourceType = MediaType;

/**
 * Storage backends supported by the Media module.
 */
export enum MediaStorageProvider {
    CLOUDINARY = "cloudinary",
    S3 = "s3",
    LOCAL = "local",
}
