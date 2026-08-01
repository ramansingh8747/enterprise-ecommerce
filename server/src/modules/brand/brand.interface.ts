/**
 * Enterprise Brand domain contracts.
 *
 * Base TypeScript interfaces shared across the Brand module layers.
 * Persistence mapping and business rules are intentionally excluded.
 * Schema-level document typing will be refined in the Brand Schema step.
 */

/**
 * Core Brand entity contract.
 */
export interface IBrand {
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Payload contract for creating a Brand.
 */
export interface ICreateBrand {
    name: string;
    slug?: string;
    description?: string;
    logo?: string;
    website?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
    createdBy?: string;
}

/**
 * Payload contract for updating a Brand.
 */
export interface IUpdateBrand {
    name?: string;
    slug?: string;
    description?: string;
    logo?: string;
    website?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
    updatedBy?: string;
}
