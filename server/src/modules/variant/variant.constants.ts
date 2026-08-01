/**
 * Enterprise Product Variant constants.
 *
 * Module-level constants for status, sorting, defaults, and SKU generation.
 */

/**
 * Variant lifecycle status values.
 */
export const VARIANT_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
} as const;

export type VariantStatus =
    (typeof VARIANT_STATUS)[keyof typeof VARIANT_STATUS];

/**
 * Sortable fields for variant listing.
 */
export const VARIANT_SORT_FIELDS = {
    SKU: "sku",
    PRICE: "price",
    STOCK: "stock",
    CREATED_AT: "createdAt",
} as const;

export type VariantSortField =
    (typeof VARIANT_SORT_FIELDS)[keyof typeof VARIANT_SORT_FIELDS];

/**
 * Default values for variant operations.
 */
export const VARIANT_DEFAULTS = {
    STOCK: 0,
    IS_ACTIVE: true,
    PAGE: 1,
    LIMIT: 10,
} as const;

/**
 * Enterprise automatic SKU generation defaults.
 * Format: <PRODUCTCODE>-<COLOR>-<SIZE>-<RANDOM>
 */
export const VARIANT_SKU_GENERATION = {
    SEPARATOR: "-",
    MAX_PRODUCT_CODE_LENGTH: 12,
    COLOR_LENGTH: 3,
    RANDOM_LENGTH: 4,
    MAX_RETRY_ATTEMPTS: 5,
    FALLBACK_COLOR: "NA",
    FALLBACK_SIZE: "OS",
} as const;

/**
 * Enterprise inventory defaults for Variant availability.
 */
export const VARIANT_INVENTORY = {
    LOW_STOCK_THRESHOLD: 5,
} as const;

/**
 * Variant availability status values (computed, not persisted).
 */
export const VARIANT_AVAILABILITY = {
    IN_STOCK: "IN_STOCK",
    OUT_OF_STOCK: "OUT_OF_STOCK",
    LOW_STOCK: "LOW_STOCK",
} as const;

export type VariantAvailability =
    (typeof VARIANT_AVAILABILITY)[keyof typeof VARIANT_AVAILABILITY];

