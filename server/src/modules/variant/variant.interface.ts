/**
 * Enterprise Product Variant domain contracts.
 *
 * Base TypeScript interfaces shared across the Variant module layers.
 * Aligned with the Variant Mongoose schema (Step 12.2).
 */

/**
 * Core Product Variant entity contract.
 * Every variant belongs to exactly one Product.
 */
export interface IProductVariant {
    product: string;
    sku: string;
    color?: string;
    size?: string;
    price: number;
    salePrice?: number;
    stock: number;
    images: string[];
    isActive: boolean;
    createdBy: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Payload contract for creating a Product Variant.
 * `sku` is optional — when omitted, the service auto-generates a unique SKU.
 */
export interface ICreateProductVariant {
    product: string;
    sku?: string;
    color?: string;
    size?: string;
    price: number;
    salePrice?: number;
    stock?: number;
    images?: string[];
    isActive?: boolean;
    createdBy?: string;
}

/**
 * Payload contract for updating a Product Variant.
 */
export interface IUpdateProductVariant {
    sku?: string;
    color?: string;
    size?: string;
    price?: number;
    salePrice?: number;
    stock?: number;
    images?: string[];
    isActive?: boolean;
    updatedBy?: string;
}
