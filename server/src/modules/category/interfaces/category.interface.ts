/**
 * Enterprise Category domain contracts.
 *
 * Base TypeScript interfaces shared across the Category module layers.
 * Persistence mapping and business rules are intentionally excluded.
 */

/**
 * Core Category entity contract.
 */
export interface ICategory {
    name: string;
    slug: string;
    description?: string;
    parent?: string | null;
    level?: number;
    isActive?: boolean;
    sortOrder?: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Payload contract for creating a Category.
 */
export interface ICreateCategory {
    name: string;
    slug: string;
    description?: string;
    parent?: string | null;
    level?: number;
    isActive?: boolean;
    sortOrder?: number;
    createdBy?: string;
}

/**
 * Payload contract for updating a Category.
 */
export interface IUpdateCategory {
    name?: string;
    slug?: string;
    description?: string;
    parent?: string | null;
    level?: number;
    isActive?: boolean;
    sortOrder?: number;
    updatedBy?: string;
}
