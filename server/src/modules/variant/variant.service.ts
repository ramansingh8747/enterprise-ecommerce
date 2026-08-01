import { Types } from "mongoose";
import { IProduct } from "../../interfaces/product.interface";
import { ProductRepository } from "../../repositories/product.repository";
import {
    VARIANT_INVENTORY,
    VARIANT_SKU_GENERATION,
} from "./variant.constants";
import {
    VariantListSortBy,
    VariantRepository,
} from "./variant.repository";
import { IProductVariantDocument } from "./models/variant.model";
import {
    ICreateProductVariant,
    IUpdateProductVariant,
} from "./variant.interface";
import {
    extractProductCode,
    generateVariantSku,
    normalizeManualSku,
    resolveSkuGeneratorConfig,
} from "./utils/sku-generator";
import {
    assertNonNegativeStock,
    planDecreaseStock,
    planIncreaseStock,
    planSetStock,
    resolveVariantAvailability,
    VariantAvailabilityStatus,
} from "./utils/variant-inventory";
import {
    assertVariantPricing,
    buildVariantPricing,
} from "./utils/variant-pricing";

/**
 * Default listing page size (aligned with Product / Brand / Category modules).
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const VARIANT_SORT_OPTIONS: readonly VariantListSortBy[] = [
    "createdAt",
    "updatedAt",
    "price",
    "stock",
    "sku",
] as const;

const INVENTORY_CONFIG = {
    lowStockThreshold: VARIANT_INVENTORY.LOW_STOCK_THRESHOLD,
} as const;

/**
 * Authenticated actor performing variant mutations.
 */
export interface VariantActor {
    _id: string | Types.ObjectId;
}

/**
 * Raw listing input accepted from the controller (pre-normalization).
 */
export interface VariantListInput {
    product?: string;
    color?: string;
    size?: string;
    isActive?: boolean | string;
    minPrice?: number | string;
    maxPrice?: number | string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number | string;
    limit?: number | string;
}

/**
 * Pagination metadata returned by variant listing.
 */
export interface VariantPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

/**
 * Variant response with computed pricing and availability fields.
 * Computed fields are not persisted. Shape is lean-document compatible.
 */
export interface VariantResponse {
    _id: Types.ObjectId;
    product: Types.ObjectId | Record<string, unknown>;
    sku: string;
    color?: string;
    size?: string;
    price: number;
    salePrice?: number;
    stock: number;
    images: string[];
    isActive: boolean;
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    finalPrice: number;
    discountPercentage: number;
    availabilityStatus: VariantAvailabilityStatus;
    [key: string]: unknown;
}

/**
 * Enterprise variant listing result.
 */
export interface VariantListResult {
    data: VariantResponse[];
    pagination: VariantPaginationMeta;
}

/**
 * Stock mutation result with previous / next inventory details.
 */
export interface VariantStockMutationResult {
    previousStock: number;
    stock: number;
    availabilityStatus: VariantAvailabilityStatus;
    variant: VariantResponse;
}

/**
 * Inbound create payload for Variant use cases.
 */
export interface CreateVariantInput extends ICreateProductVariant {}

/**
 * Inbound update payload for Variant use cases.
 * Optional `product` allows re-parenting when the caller supplies it.
 */
export interface UpdateVariantInput extends IUpdateProductVariant {
    product?: string;
}

/**
 * Enterprise Product Variant Service.
 *
 * Application layer for Variant use cases (SRP).
 * Enforces domain rules and delegates persistence to VariantRepository (DIP).
 * Product existence checks go through ProductRepository — no direct model access.
 */
export class VariantService {
    constructor(
        private readonly variantRepository: VariantRepository,
        private readonly productRepository: ProductRepository = new ProductRepository()
    ) {}

    /**
     * Creates a variant after verifying Product existence and resolving SKU.
     * Auto-generates a unique SKU when one is not provided.
     * Returns computed pricing and availability fields.
     */
    async createVariant(
        data: CreateVariantInput,
        currentUser: VariantActor
    ): Promise<VariantResponse> {
        const product = await this.requireProduct(data.product);

        const color = this.trimOptional(data.color);
        const size = this.trimOptional(data.size);
        const sku = await this.resolveCreateSku(data.sku, product, color, size);

        const price = data.price;
        const salePrice = data.salePrice;
        assertVariantPricing(price, salePrice);

        const stock = data.stock ?? 0;
        assertNonNegativeStock(stock);

        const actorId = this.toObjectId(currentUser._id);

        const created = await this.variantRepository.createVariant({
            product: this.toObjectId(data.product),
            sku,
            color,
            size,
            price,
            salePrice,
            stock,
            images: data.images ?? [],
            isActive: data.isActive ?? true,
            createdBy: actorId,
            updatedBy: actorId,
        } as Partial<IProductVariantDocument>);

        const populated = await this.variantRepository.findById(created._id);

        if (!populated) {
            throw new Error("Variant not found.");
        }

        return this.toVariantResponse(populated);
    }

    /**
     * Retrieves a variant by id with populated Product details.
     */
    async getVariantById(id: string): Promise<VariantResponse> {
        const variant = await this.variantRepository.findById(id);

        if (!variant) {
            throw new Error("Variant not found.");
        }

        return this.toVariantResponse(variant);
    }

    /**
     * Retrieves a variant by SKU with populated Product details.
     */
    async getVariantBySku(sku: string): Promise<VariantResponse> {
        const variant = await this.variantRepository.findBySku(
            normalizeManualSku(sku)
        );

        if (!variant) {
            throw new Error("Variant not found.");
        }

        return this.toVariantResponse(variant);
    }

    /**
     * Lists variants with search, filters, sort, and pagination.
     */
    async getAllVariants(
        rawQuery: VariantListInput = {}
    ): Promise<VariantListResult> {
        const query = this.normalizeListQuery(rawQuery);
        const { items, total } = await this.variantRepository.findAll(
            {
                product: query.product,
                color: query.color,
                size: query.size,
                isActive: query.isActive,
                minPrice: query.minPrice,
                maxPrice: query.maxPrice,
                search: query.search,
            },
            {
                page: query.page,
                limit: query.limit,
                sortBy: query.sortBy,
                sortDirection: query.sortDirection,
                populateProduct: true,
            }
        );

        const totalPages =
            total === 0 ? 0 : Math.ceil(total / query.limit);

        return {
            data: items.map((item) => this.toVariantResponse(item)),
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
     * Updates a variant after verifying existence and domain constraints.
     * Recalculates computed pricing / availability on response.
     */
    async updateVariant(
        id: string,
        data: UpdateVariantInput,
        currentUser: VariantActor
    ): Promise<VariantResponse> {
        const existing = await this.variantRepository.findById(id, {
            populateProduct: false,
        });

        if (!existing) {
            throw new Error("Variant not found.");
        }

        if (data.product !== undefined) {
            await this.assertProductExists(data.product);
        }

        const sku =
            data.sku !== undefined
                ? normalizeManualSku(data.sku)
                : existing.sku;

        if (data.sku !== undefined && sku !== existing.sku) {
            await this.assertSkuUnique(sku, id);
        }

        const price =
            data.price !== undefined ? data.price : existing.price;
        const salePrice =
            data.salePrice !== undefined
                ? data.salePrice
                : existing.salePrice;

        assertVariantPricing(price, salePrice);

        if (data.stock !== undefined) {
            assertNonNegativeStock(data.stock);
        }

        const updatePayload: Record<string, unknown> = {
            updatedBy: this.toObjectId(currentUser._id),
        };

        if (data.product !== undefined) {
            updatePayload.product = this.toObjectId(data.product);
        }

        if (data.sku !== undefined) {
            updatePayload.sku = sku;
        }

        if (data.color !== undefined) {
            updatePayload.color = this.trimOptional(data.color);
        }

        if (data.size !== undefined) {
            updatePayload.size = this.trimOptional(data.size);
        }

        if (data.price !== undefined) {
            updatePayload.price = data.price;
        }

        if (data.salePrice !== undefined) {
            updatePayload.salePrice = data.salePrice;
        }

        if (data.stock !== undefined) {
            updatePayload.stock = data.stock;
        }

        if (data.images !== undefined) {
            updatePayload.images = data.images;
        }

        if (data.isActive !== undefined) {
            updatePayload.isActive = data.isActive;
        }

        const updated = await this.variantRepository.updateVariant(
            id,
            updatePayload
        );

        if (!updated) {
            throw new Error("Variant not found.");
        }

        return this.toVariantResponse(updated);
    }

    /**
     * Hard-deletes a variant after verifying it exists.
     */
    async deleteVariant(id: string): Promise<VariantResponse> {
        const existing = await this.variantRepository.findById(id);

        if (!existing) {
            throw new Error("Variant not found.");
        }

        const deleted = await this.variantRepository.deleteVariant(id);

        if (!deleted) {
            throw new Error("Variant not found.");
        }

        return this.toVariantResponse(deleted);
    }

    /**
     * Returns all variants for a Product after verifying the Product exists.
     */
    async getVariantsByProduct(
        productId: string
    ): Promise<VariantResponse[]> {
        await this.assertProductExists(productId);

        const variants = await this.variantRepository.findByProduct(
            productId,
            {
                populateProduct: true,
                sortBy: "createdAt",
                sortDirection: "desc",
            }
        );

        return variants.map((variant) => this.toVariantResponse(variant));
    }

    /**
     * Sets absolute stock (used by the stock update API).
     */
    async updateVariantStock(
        id: string,
        stock: number
    ): Promise<VariantStockMutationResult> {
        return this.setStock(id, stock);
    }

    /**
     * Sets absolute stock to a non-negative quantity.
     */
    async setStock(
        id: string,
        quantity: number
    ): Promise<VariantStockMutationResult> {
        const existing = await this.requireVariant(id);
        const plan = planSetStock(
            existing.stock,
            quantity,
            INVENTORY_CONFIG
        );

        return this.persistStockMutation(id, plan);
    }

    /**
     * Increases stock by a positive quantity.
     */
    async increaseStock(
        id: string,
        quantity: number
    ): Promise<VariantStockMutationResult> {
        const existing = await this.requireVariant(id);
        const plan = planIncreaseStock(
            existing.stock,
            quantity,
            INVENTORY_CONFIG
        );

        return this.persistStockMutation(id, plan);
    }

    /**
     * Decreases stock by a positive quantity without going negative.
     */
    async decreaseStock(
        id: string,
        quantity: number
    ): Promise<VariantStockMutationResult> {
        const existing = await this.requireVariant(id);
        const plan = planDecreaseStock(
            existing.stock,
            quantity,
            INVENTORY_CONFIG
        );

        return this.persistStockMutation(id, plan);
    }

    /**
     * Loads a Product or throws when missing.
     */
    private async requireProduct(
        productId: string | Types.ObjectId
    ): Promise<IProduct> {
        const product = await this.productRepository.findById(productId);

        if (!product) {
            throw new Error("Product not found.");
        }

        return product;
    }

    /**
     * Loads a Variant or throws when missing.
     */
    private async requireVariant(
        id: string
    ): Promise<IProductVariantDocument> {
        const variant = await this.variantRepository.findById(id, {
            populateProduct: false,
        });

        if (!variant) {
            throw new Error("Variant not found.");
        }

        return variant;
    }

    /**
     * Persists a validated stock mutation and returns inventory details.
     */
    private async persistStockMutation(
        id: string,
        plan: {
            previousStock: number;
            stock: number;
            availabilityStatus: VariantAvailabilityStatus;
        }
    ): Promise<VariantStockMutationResult> {
        const updated = await this.variantRepository.updateStock(
            id,
            plan.stock
        );

        if (!updated) {
            throw new Error("Variant not found.");
        }

        const variant = this.toVariantResponse(updated);

        return {
            previousStock: plan.previousStock,
            stock: plan.stock,
            availabilityStatus: plan.availabilityStatus,
            variant,
        };
    }

    /**
     * Attaches computed pricing and availability fields to a Variant.
     */
    private toVariantResponse(
        variant: IProductVariantDocument
    ): VariantResponse {
        const pricing = buildVariantPricing({
            price: variant.price,
            salePrice: variant.salePrice,
        });

        return {
            ...(variant as unknown as Record<string, unknown>),
            finalPrice: pricing.finalPrice,
            discountPercentage: pricing.discountPercentage,
            availabilityStatus: resolveVariantAvailability(
                variant.stock,
                INVENTORY_CONFIG
            ),
        } as VariantResponse;
    }

    /**
     * Verifies that a Product exists via ProductRepository.
     */
    private async assertProductExists(
        productId: string | Types.ObjectId
    ): Promise<void> {
        await this.requireProduct(productId);
    }

    /**
     * Resolves create-time SKU: normalize manual value or auto-generate.
     */
    private async resolveCreateSku(
        manualSku: string | undefined,
        product: IProduct,
        color?: string,
        size?: string
    ): Promise<string> {
        if (manualSku !== undefined && manualSku !== null) {
            const trimmed = String(manualSku).trim();

            if (trimmed.length > 0) {
                const sku = normalizeManualSku(trimmed);
                await this.assertSkuUnique(sku);
                return sku;
            }
        }

        return this.generateUniqueSku(product, color, size);
    }

    /**
     * Generates a unique SKU with bounded retries on collision.
     */
    private async generateUniqueSku(
        product: IProduct,
        color?: string,
        size?: string
    ): Promise<string> {
        const skuConfig = resolveSkuGeneratorConfig({
            separator: VARIANT_SKU_GENERATION.SEPARATOR,
            maxProductCodeLength:
                VARIANT_SKU_GENERATION.MAX_PRODUCT_CODE_LENGTH,
            colorLength: VARIANT_SKU_GENERATION.COLOR_LENGTH,
            randomLength: VARIANT_SKU_GENERATION.RANDOM_LENGTH,
            fallbackColor: VARIANT_SKU_GENERATION.FALLBACK_COLOR,
            fallbackSize: VARIANT_SKU_GENERATION.FALLBACK_SIZE,
        });

        const productCode = extractProductCode(product, skuConfig);
        const maxAttempts = VARIANT_SKU_GENERATION.MAX_RETRY_ATTEMPTS;

        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            const candidate = generateVariantSku(
                {
                    productCode,
                    color,
                    size,
                },
                skuConfig
            );

            const exists =
                await this.variantRepository.existsBySku(candidate);

            if (!exists) {
                return candidate;
            }
        }

        throw new Error("Unable to generate a unique variant SKU.");
    }

    /**
     * Enforces global variant SKU uniqueness.
     */
    private async assertSkuUnique(
        sku: string,
        excludeId?: string
    ): Promise<void> {
        const existing = await this.variantRepository.findBySku(sku, {
            populateProduct: false,
        });

        if (!existing) {
            return;
        }

        if (excludeId && existing._id.toString() === excludeId) {
            return;
        }

        throw new Error("Variant with this SKU already exists.");
    }

    /**
     * Trims optional string fields; empty strings become undefined.
     */
    private trimOptional(value?: string): string | undefined {
        if (value === undefined || value === null) {
            return undefined;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }

    /**
     * Applies listing business rules: defaults, bounds, and enum checks.
     */
    private normalizeListQuery(rawQuery: VariantListInput): {
        product?: string;
        color?: string;
        size?: string;
        isActive?: boolean;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
        sortBy: VariantListSortBy;
        sortDirection: "asc" | "desc";
        page: number;
        limit: number;
    } {
        return {
            product: rawQuery.product?.trim() || undefined,
            color: rawQuery.color?.trim() || undefined,
            size: rawQuery.size?.trim() || undefined,
            isActive: this.resolveOptionalBoolean(rawQuery.isActive),
            minPrice: this.resolveOptionalNumber(rawQuery.minPrice),
            maxPrice: this.resolveOptionalNumber(rawQuery.maxPrice),
            search: rawQuery.search?.trim() || undefined,
            sortBy: this.resolveSortBy(rawQuery.sortBy),
            sortDirection: this.resolveSortDirection(rawQuery.sortOrder),
            page: this.resolvePage(rawQuery.page),
            limit: this.resolveLimit(rawQuery.limit),
        };
    }

    private resolveSortBy(sortBy?: string): VariantListSortBy {
        if (
            sortBy &&
            (VARIANT_SORT_OPTIONS as readonly string[]).includes(sortBy)
        ) {
            return sortBy as VariantListSortBy;
        }

        return "createdAt";
    }

    private resolveSortDirection(sortOrder?: string): "asc" | "desc" {
        if (sortOrder === "asc" || sortOrder === "desc") {
            return sortOrder;
        }

        return "desc";
    }

    private resolvePage(page?: number | string): number {
        const parsed =
            typeof page === "string" ? Number(page) : page;

        if (
            typeof parsed !== "number" ||
            !Number.isFinite(parsed) ||
            parsed < 1
        ) {
            return DEFAULT_PAGE;
        }

        return Math.floor(parsed);
    }

    private resolveLimit(limit?: number | string): number {
        const parsed =
            typeof limit === "string" ? Number(limit) : limit;

        if (
            typeof parsed !== "number" ||
            !Number.isFinite(parsed) ||
            parsed < 1
        ) {
            return DEFAULT_LIMIT;
        }

        return Math.min(Math.floor(parsed), MAX_LIMIT);
    }

    private resolveOptionalBoolean(
        value?: boolean | string
    ): boolean | undefined {
        if (typeof value === "boolean") {
            return value;
        }

        if (value === "true") {
            return true;
        }

        if (value === "false") {
            return false;
        }

        return undefined;
    }

    private resolveOptionalNumber(
        value?: number | string
    ): number | undefined {
        if (value === undefined || value === null || value === "") {
            return undefined;
        }

        const parsed =
            typeof value === "string" ? Number(value) : value;

        if (typeof parsed !== "number" || !Number.isFinite(parsed)) {
            return undefined;
        }

        return parsed;
    }

    private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
        return typeof id === "string" ? new Types.ObjectId(id) : id;
    }
}
