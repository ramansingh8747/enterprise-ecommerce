import { ProductStatus, StockStatus } from "./product.interface";
import { IProduct } from "./product.interface";

/**
 * Supported product listing sort keys.
 */
export const PRODUCT_SORT_OPTIONS = [
    "newest",
    "oldest",
    "priceAsc",
    "priceDesc",
    "nameAsc",
    "nameDesc",
] as const;

export type ProductSortOption = (typeof PRODUCT_SORT_OPTIONS)[number];

/**
 * Normalized listing query used by service and repository layers.
 */
export interface ProductListQuery {
    search?: string;

    category?: string;
    brand?: string;
    status?: ProductStatus;
    stockStatus?: StockStatus;
    isFeatured?: boolean;
    isDigital?: boolean;
    minimumPrice?: number;
    maximumPrice?: number;
    tags?: string[];

    sort: ProductSortOption;
    page: number;
    limit: number;
}

/**
 * Pagination metadata returned by GET /products.
 */
export interface ProductPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

/**
 * Enterprise product listing result.
 */
export interface ProductListResult {
    data: IProduct[];
    pagination: ProductPaginationMeta;
}
