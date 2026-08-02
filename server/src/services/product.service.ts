import { QueryFilter, QueryOptions, Types } from "mongoose";
import { IProduct } from "../interfaces/product.interface";
import {
    ProductStatus,
    StockStatus,
} from "../interfaces/product.interface";
import { IProductWithMedia, IProductLeanBase } from "../interfaces/product-media.interface";
import {
    PRODUCT_SORT_OPTIONS,
    ProductListQuery,
    ProductListResult,
    ProductSortOption,
} from "../interfaces/product-listing.interface";
import { BrandStatus } from "../interfaces/brand.interface";
import { BrandRepository } from "../modules/brand/brand.repository";
import {
    toProductMediaSummary,
} from "../modules/media/interfaces/product-media-summary.interface";
import { MediaRepository } from "../modules/media/repositories/media.repository";
import { ProductRepository } from "../repositories/product.repository";

/**
 * Default listing page size.
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Raw listing input accepted from the controller (pre-normalization).
 */
export interface ProductListInput {
    search?: string;
    category?: string;
    brand?: string;
    status?: string;
    stockStatus?: string;
    isFeatured?: boolean;
    isDigital?: boolean;
    minimumPrice?: number;
    maximumPrice?: number;
    tags?: string[];
    sort?: string;
    page?: number;
    limit?: number;
}

/**
 * Enterprise Product Service.
 *
 * Application layer for Product use cases (SRP).
 * Enforces domain rules and delegates persistence to ProductRepository (DIP).
 * Attaches Media summaries via MediaRepository (Step 13.6) — no circular imports.
 */
export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly brandRepository: BrandRepository,
        private readonly mediaRepository: MediaRepository = new MediaRepository()
    ) {}

    /**
     * Creates a product after enforcing SKU/slug uniqueness and Brand existence.
     * `thumbnail` / `images` must be Cloudinary URL strings when provided (legacy).
     * Media ObjectId refs remain empty until Media upload APIs sync them later.
     */
    async createProduct(data: Partial<IProduct>): Promise<IProductWithMedia> {
        if (!data.brand) {
            throw new Error("Brand not found.");
        }

        await this.assertBrandExistsAndActive(data.brand);

        if (data.sku) {
            const skuExists = await this.productRepository.exists({
                sku: data.sku,
            });

            if (skuExists) {
                throw new Error("Product with this SKU already exists.");
            }
        }

        if (data.slug) {
            const slugExists = await this.productRepository.exists({
                slug: data.slug,
            });

            if (slugExists) {
                throw new Error("Product with this slug already exists.");
            }
        }

        const product = await this.productRepository.create(data);
        return this.attachMedia(product);
    }

    /**
     * Retrieves a product by id with selective Media summaries.
     */
    async getProductById(
        id: string | Types.ObjectId
    ): Promise<IProductWithMedia> {
        const product = await this.productRepository.findById(id);

        if (!product) {
            throw new Error("Product not found.");
        }

        return this.attachMedia(product);
    }

    /**
     * Retrieves a product by SKU with selective Media summaries.
     */
    async getProductBySku(sku: string): Promise<IProductWithMedia> {
        const product = await this.productRepository.findBySku(sku);

        if (!product) {
            throw new Error("Product not found.");
        }

        return this.attachMedia(product);
    }

    /**
     * Retrieves a product by slug with selective Media summaries.
     */
    async getProductBySlug(slug: string): Promise<IProductWithMedia> {
        const product = await this.productRepository.findBySlug(slug);

        if (!product) {
            throw new Error("Product not found.");
        }

        return this.attachMedia(product);
    }

    /**
     * Retrieves products using the caller-provided filter and options.
     * Preserved for non-listing consumers — attaches Media in one batch query.
     */
    async getProducts(
        filter: QueryFilter<IProduct> = {},
        options: QueryOptions = {}
    ): Promise<IProductWithMedia[]> {
        const products = await this.productRepository.findAll(filter, options);
        return this.attachMediaMany(products);
    }

    /**
     * Enterprise product listing with search, filters, sort, and pagination.
     * Media summaries are batch-loaded to avoid N+1 queries.
     */
    async listProducts(rawQuery: ProductListInput): Promise<ProductListResult> {
        const query = this.normalizeListQuery(rawQuery);
        const { items, total } =
            await this.productRepository.findByListing(query);

        const totalPages =
            total === 0 ? 0 : Math.ceil(total / query.limit);

        const data = await this.attachMediaMany(items);

        return {
            data,
            pagination: {
                total,
                page: query.page,
                limit: query.limit,
                totalPages,
                hasNext: query.page < totalPages,
                hasPrevious: query.page > 1 && totalPages > 0,
            },
        };
    }

    /**
     * Updates a product after verifying existence and uniqueness constraints.
     * `thumbnail` / `images` must be Cloudinary URL strings when provided (legacy).
     * Brand is validated only when included in the update payload.
     */
    async updateProduct(
        id: string | Types.ObjectId,
        data: Partial<IProduct>
    ): Promise<IProductWithMedia> {
        const existing = await this.productRepository.findById(id);

        if (!existing) {
            throw new Error("Product not found.");
        }

        if (data.brand !== undefined) {
            await this.assertBrandExistsAndActive(data.brand);
        }

        if (data.sku && data.sku !== existing.sku) {
            const skuExists = await this.productRepository.exists({
                sku: data.sku,
            });

            if (skuExists) {
                throw new Error("Product with this SKU already exists.");
            }
        }

        if (data.slug && data.slug !== existing.slug) {
            const slugExists = await this.productRepository.exists({
                slug: data.slug,
            });

            if (slugExists) {
                throw new Error("Product with this slug already exists.");
            }
        }

        const updated = await this.productRepository.updateById(id, data);

        if (!updated) {
            throw new Error("Product not found.");
        }

        return this.attachMedia(updated);
    }

    /**
     * Deletes a product after verifying it exists.
     */
    async deleteProduct(
        id: string | Types.ObjectId
    ): Promise<IProductWithMedia> {
        const existing = await this.productRepository.findById(id);

        if (!existing) {
            throw new Error("Product not found.");
        }

        const deleted = await this.productRepository.deleteById(id);

        if (!deleted) {
            throw new Error("Product not found.");
        }

        return this.attachMedia(deleted);
    }

    /**
     * Checks whether a product matching the filter exists.
     */
    async productExists(filter: QueryFilter<IProduct>): Promise<boolean> {
        return this.productRepository.exists(filter);
    }

    /**
     * Counts products matching the filter.
     */
    async countProducts(
        filter: QueryFilter<IProduct> = {}
    ): Promise<number> {
        return this.productRepository.count(filter);
    }

    /**
     * Attaches selective Media summaries for a single Product.
     * Media is loaded by productId (Media remains asset owner).
     */
    private async attachMedia(product: IProduct): Promise<IProductWithMedia> {
        const productId = String(product._id);
        const summaries =
            await this.mediaRepository.findSummariesByProduct(productId);

        return {
            ...(product as unknown as IProductLeanBase),
            media: summaries.map(toProductMediaSummary),
        };
    }

    /**
     * Batch-attaches Media summaries for many Products (one Media query).
     */
    private async attachMediaMany(
        products: IProduct[]
    ): Promise<IProductWithMedia[]> {
        if (!products.length) {
            return [];
        }

        const productIds = products.map((product) => String(product._id));
        const summaries =
            await this.mediaRepository.findSummariesByProductIds(productIds);

        const mediaByProductId = new Map<
            string,
            ReturnType<typeof toProductMediaSummary>[]
        >();

        for (const summary of summaries) {
            const key = String(summary.productId);
            const list = mediaByProductId.get(key) ?? [];
            list.push(toProductMediaSummary(summary));
            mediaByProductId.set(key, list);
        }

        return products.map((product) => ({
            ...(product as unknown as IProductLeanBase),
            media: mediaByProductId.get(String(product._id)) ?? [],
        }));
    }

    /**
     * Ensures the Brand exists, is ACTIVE, and is not soft-deleted.
     * Soft-deleted brands are already excluded by Brand model query middleware.
     */
    private async assertBrandExistsAndActive(
        brandId: string | Types.ObjectId
    ): Promise<void> {
        const brand = await this.brandRepository.findById(brandId);

        if (!brand || brand.status !== BrandStatus.ACTIVE) {
            throw new Error("Brand not found.");
        }
    }

    /**
     * Applies listing business rules: defaults, bounds, and enum checks.
     */
    private normalizeListQuery(rawQuery: ProductListInput): ProductListQuery {
        const sort = this.resolveSort(rawQuery.sort);
        const page = this.resolvePage(rawQuery.page);
        const limit = this.resolveLimit(rawQuery.limit);

        if (
            typeof rawQuery.minimumPrice === "number" &&
            typeof rawQuery.maximumPrice === "number" &&
            rawQuery.minimumPrice > rawQuery.maximumPrice
        ) {
            throw new Error(
                "minimumPrice cannot be greater than maximumPrice."
            );
        }

        const status = this.resolveStatus(rawQuery.status);
        const stockStatus = this.resolveStockStatus(rawQuery.stockStatus);

        return {
            search: rawQuery.search?.trim() || undefined,
            category: rawQuery.category?.trim() || undefined,
            brand: rawQuery.brand?.trim() || undefined,
            status,
            stockStatus,
            isFeatured: rawQuery.isFeatured,
            isDigital: rawQuery.isDigital,
            minimumPrice: rawQuery.minimumPrice,
            maximumPrice: rawQuery.maximumPrice,
            tags: rawQuery.tags,
            sort,
            page,
            limit,
        };
    }

    private resolveSort(sort?: string): ProductSortOption {
        if (!sort) {
            return "newest";
        }

        if (
            (PRODUCT_SORT_OPTIONS as readonly string[]).includes(sort)
        ) {
            return sort as ProductSortOption;
        }

        throw new Error(
            `Invalid sort option. Allowed: ${PRODUCT_SORT_OPTIONS.join(", ")}.`
        );
    }

    private resolvePage(page?: number): number {
        if (typeof page !== "number" || Number.isNaN(page) || page < 1) {
            return DEFAULT_PAGE;
        }

        return Math.floor(page);
    }

    private resolveLimit(limit?: number): number {
        if (typeof limit !== "number" || Number.isNaN(limit) || limit < 1) {
            return DEFAULT_LIMIT;
        }

        return Math.min(Math.floor(limit), MAX_LIMIT);
    }

    private resolveStatus(
        status?: string | ProductStatus
    ): ProductStatus | undefined {
        if (!status) {
            return undefined;
        }

        const values = Object.values(ProductStatus) as string[];

        if (!values.includes(status)) {
            throw new Error(
                `Invalid status. Allowed: ${values.join(", ")}.`
            );
        }

        return status as ProductStatus;
    }

    private resolveStockStatus(
        stockStatus?: string | StockStatus
    ): StockStatus | undefined {
        if (!stockStatus) {
            return undefined;
        }

        const values = Object.values(StockStatus) as string[];

        if (!values.includes(stockStatus)) {
            throw new Error(
                `Invalid stockStatus. Allowed: ${values.join(", ")}.`
            );
        }

        return stockStatus as StockStatus;
    }
}
