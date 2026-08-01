import { Document, Types } from "mongoose";

/**
 * Enterprise product lifecycle status.
 */
export enum ProductStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DRAFT = "DRAFT",
    ARCHIVED = "ARCHIVED",
}

/**
 * Enterprise inventory availability status.
 */
export enum StockStatus {
    IN_STOCK = "IN_STOCK",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    LOW_STOCK = "LOW_STOCK",
    PREORDER = "PREORDER",
}

/**
 * Enterprise Product domain contract.
 *
 * Shared type used by the model, repository, service, and controller layers.
 */
export interface IProduct extends Document {
    name: string;
    slug: string;
    sku: string;

    shortDescription: string;
    description: string;

    price: number;
    comparePrice?: number;
    costPrice?: number;
    currency: string;

    quantity: number;
    lowStockThreshold: number;

    category: Types.ObjectId;
    brand: Types.ObjectId;

    images: string[];
    thumbnail?: string;
    tags: string[];

    status: ProductStatus;
    stockStatus: StockStatus;

    isFeatured: boolean;
    isDigital: boolean;

    weight?: number;
    length?: number;
    width?: number;
    height?: number;

    seoTitle?: string;
    seoDescription?: string;
    seoKeywords: string[];

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}
