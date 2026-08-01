/**
 * Enterprise Category constants.
 *
 * Placeholder module-level constants for status, sorting, and defaults.
 * Values will be finalized when schema and listing rules are implemented.
 */

/**
 * Placeholder category lifecycle status values.
 */
export const CATEGORY_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
} as const;

export type CategoryStatus =
    (typeof CATEGORY_STATUS)[keyof typeof CATEGORY_STATUS];

/**
 * Placeholder sortable fields for category listing.
 */
export const CATEGORY_SORT_FIELDS = {
    NAME: "name",
    SLUG: "slug",
    SORT_ORDER: "sortOrder",
    CREATED_AT: "createdAt",
} as const;

export type CategorySortField =
    (typeof CATEGORY_SORT_FIELDS)[keyof typeof CATEGORY_SORT_FIELDS];

/**
 * Placeholder default values for category operations.
 */
export const CATEGORY_DEFAULTS = {
    LEVEL: 0,
    SORT_ORDER: 0,
    IS_ACTIVE: true,
    PAGE: 1,
    LIMIT: 10,
} as const;
