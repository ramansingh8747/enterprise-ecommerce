/**
 * Enterprise Media Module constants (Step 13.3).
 */

import {
    MediaOwnerType,
    MediaStorageProvider,
    MediaType,
} from "./types/media.types";

/**
 * Default values for Media operations.
 */
export const MEDIA_DEFAULTS = {
    MEDIA_TYPE: MediaType.IMAGE,
    /** @deprecated Prefer MEDIA_TYPE */
    RESOURCE_TYPE: MediaType.IMAGE,
    STORAGE_PROVIDER: MediaStorageProvider.CLOUDINARY,
    IS_PRIMARY: false,
    DISPLAY_ORDER: 0,
    PAGE: 1,
    LIMIT: 20,
} as const;

/**
 * Primary owner integration for Module 13 (Product Images).
 */
export const MEDIA_PRIMARY_OWNER = MediaOwnerType.PRODUCT;

/**
 * Cloudinary folder prefixes (wiring lands in upload API steps).
 */
export const MEDIA_STORAGE_FOLDERS = {
    PRODUCTS: "enterprise-ecommerce/products",
    VARIANTS: "enterprise-ecommerce/variants",
    CATEGORIES: "enterprise-ecommerce/categories",
    BRANDS: "enterprise-ecommerce/brands",
} as const;
