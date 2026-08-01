/**
 * Enterprise Brand constants.
 *
 * Module-level constants for status, sorting, and defaults.
 * Values will be finalized when schema and listing rules are implemented.
 */

/**
 * Placeholder brand lifecycle status values.
 */
export const BRAND_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
} as const;

export type BrandStatus =
    (typeof BRAND_STATUS)[keyof typeof BRAND_STATUS];

/**
 * Placeholder sortable fields for brand listing.
 */
export const BRAND_SORT_FIELDS = {
    NAME: "name",
    SLUG: "slug",
    SORT_ORDER: "sortOrder",
    CREATED_AT: "createdAt",
} as const;

export type BrandSortField =
    (typeof BRAND_SORT_FIELDS)[keyof typeof BRAND_SORT_FIELDS];

/**
 * Placeholder default values for brand operations.
 */
export const BRAND_DEFAULTS = {
    SORT_ORDER: 0,
    IS_ACTIVE: true,
    IS_FEATURED: false,
    PAGE: 1,
    LIMIT: 10,
} as const;
