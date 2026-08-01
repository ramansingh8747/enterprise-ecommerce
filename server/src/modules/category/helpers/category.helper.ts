/**
 * Enterprise Category helpers.
 *
 * Placeholder utility functions for the Category module.
 * No business rules or persistence side effects.
 */

/**
 * Placeholder helper for normalizing a category slug candidate.
 */
export const normalizeCategorySlug = (value: string): string => {
    return value;
};

/**
 * Placeholder helper for building a category display label.
 */
export const buildCategoryLabel = (name: string): string => {
    return name;
};

/**
 * Placeholder helper for detecting a root-level category candidate.
 */
export const isRootCategoryCandidate = (parent?: string | null): boolean => {
    return parent === undefined || parent === null || parent === "";
};
