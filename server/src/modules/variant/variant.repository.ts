import {
    Model,
    QueryFilter,
    SortOrder,
    Types,
    UpdateQuery,
} from "mongoose";
import ProductVariant, {
    IProductVariantDocument,
} from "./models/variant.model";
import { ICreateProductVariant, IUpdateProductVariant } from "./variant.interface";

/**
 * Selective Product populate options for Variant responses.
 */
const PRODUCT_POPULATE = {
    path: "product",
    select: "_id name slug sku",
} as const;

/**
 * Optional read options for Variant queries.
 */
export interface VariantQueryOptions {
    page?: number;
    limit?: number;
    sort?: Record<string, SortOrder> | string;
    projection?: string | Record<string, 0 | 1>;
    populateProduct?: boolean;
    sortBy?: VariantListSortBy;
    sortDirection?: "asc" | "desc";
}

/**
 * Sortable fields for enterprise variant listing.
 */
export type VariantListSortBy =
    | "createdAt"
    | "updatedAt"
    | "price"
    | "stock"
    | "sku";

/**
 * Filter shape accepted by findAll / count.
 */
export interface VariantListFilters {
    product?: string;
    color?: string;
    size?: string;
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
}

/**
 * Normalized listing query used by the service layer.
 */
export interface VariantListQuery extends VariantListFilters {
    sortBy: VariantListSortBy;
    sortDirection: "asc" | "desc";
    page: number;
    limit: number;
    populateProduct?: boolean;
}

/**
 * Enterprise Product Variant Repository.
 *
 * Data-access layer for Variant persistence (SRP).
 * Isolates MongoDB/Mongoose operations from the service layer (DIP).
 * No business rules, validation, or HTTP concerns.
 */
export class VariantRepository {
    private readonly variantModel: Model<IProductVariantDocument>;

    /**
     * @param variantModel - Injected Variant model (defaults to ProductVariant).
     */
    constructor(
        variantModel: Model<IProductVariantDocument> = ProductVariant
    ) {
        this.variantModel = variantModel;
    }

    /**
     * Persists a new variant document.
     */
    async createVariant(
        data: Partial<IProductVariantDocument> | ICreateProductVariant
    ): Promise<IProductVariantDocument> {
        return this.variantModel.create(data);
    }

    /**
     * Finds a variant by MongoDB ObjectId.
     * Optionally populates the parent Product.
     */
    async findById(
        id: string | Types.ObjectId,
        options: Pick<
            VariantQueryOptions,
            "projection" | "populateProduct"
        > = {}
    ): Promise<IProductVariantDocument | null> {
        let query = this.variantModel.findById(id);

        if (options.projection) {
            query = query.select(options.projection);
        }

        if (options.populateProduct !== false) {
            query = query.populate(PRODUCT_POPULATE);
        }

        return query.lean<IProductVariantDocument | null>().exec();
    }

    /**
     * Finds a variant by unique SKU.
     */
    async findBySku(
        sku: string,
        options: Pick<
            VariantQueryOptions,
            "projection" | "populateProduct"
        > = {}
    ): Promise<IProductVariantDocument | null> {
        let query = this.variantModel.findOne({
            sku: sku.trim().toUpperCase(),
        });

        if (options.projection) {
            query = query.select(options.projection);
        }

        if (options.populateProduct !== false) {
            query = query.populate(PRODUCT_POPULATE);
        }

        return query.lean<IProductVariantDocument | null>().exec();
    }

    /**
     * Updates a variant by id and returns the updated document.
     */
    async updateVariant(
        id: string | Types.ObjectId,
        data: UpdateQuery<IProductVariantDocument> | IUpdateProductVariant
    ): Promise<IProductVariantDocument | null> {
        const updated = await this.variantModel
            .findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            })
            .lean<IProductVariantDocument | null>()
            .exec();

        if (!updated) {
            return null;
        }

        return this.findById(id);
    }

    /**
     * Hard-deletes a variant by id and returns the deleted document.
     */
    async deleteVariant(
        id: string | Types.ObjectId
    ): Promise<IProductVariantDocument | null> {
        return this.variantModel
            .findByIdAndDelete(id)
            .populate(PRODUCT_POPULATE)
            .lean<IProductVariantDocument | null>()
            .exec();
    }

    /**
     * Finds variants with filters, pagination, and sorting.
     * Returns items and total for service-layer pagination metadata.
     */
    async findAll(
        filters: VariantListFilters = {},
        options: VariantQueryOptions = {}
    ): Promise<{ items: IProductVariantDocument[]; total: number }> {
        const filter = this.buildListingFilter(filters);
        const sort = this.resolveSort(options);
        const page = options.page;
        const limit = options.limit;

        let findQuery = this.variantModel.find(filter).sort(sort);

        if (options.projection) {
            findQuery = findQuery.select(options.projection);
        }

        if (options.populateProduct !== false) {
            findQuery = findQuery.populate(PRODUCT_POPULATE);
        }

        if (
            typeof page === "number" &&
            typeof limit === "number" &&
            page > 0 &&
            limit > 0
        ) {
            const skip = (page - 1) * limit;
            findQuery = findQuery.skip(skip).limit(limit);
        } else if (typeof limit === "number" && limit > 0) {
            findQuery = findQuery.limit(limit);
        }

        const [items, total] = await Promise.all([
            findQuery.lean<IProductVariantDocument[]>().exec(),
            this.variantModel.countDocuments(filter).exec(),
        ]);

        return { items, total };
    }

    /**
     * Counts variants matching the provided filters.
     */
    async count(filters: VariantListFilters = {}): Promise<number> {
        const filter = this.buildListingFilter(filters);
        return this.variantModel.countDocuments(filter).exec();
    }

    /**
     * Finds variants belonging to a Product.
     */
    async findByProduct(
        productId: string | Types.ObjectId,
        options: VariantQueryOptions = {}
    ): Promise<IProductVariantDocument[]> {
        const { items } = await this.findAll(
            { product: productId.toString() },
            {
                ...options,
                sortBy: options.sortBy ?? "createdAt",
                sortDirection: options.sortDirection ?? "desc",
            }
        );

        return items;
    }

    /**
     * Updates only the stock field of a variant.
     */
    async updateStock(
        id: string | Types.ObjectId,
        stock: number
    ): Promise<IProductVariantDocument | null> {
        return this.updateVariant(id, { stock });
    }

    /**
     * Returns whether a variant with the given id exists.
     */
    async exists(id: string | Types.ObjectId): Promise<boolean> {
        const result = await this.variantModel
            .exists({ _id: id })
            .exec();

        return result !== null;
    }

    /**
     * Returns whether a variant with the given SKU exists.
     */
    async existsBySku(sku: string): Promise<boolean> {
        const result = await this.variantModel
            .exists({ sku: sku.trim().toUpperCase() })
            .exec();

        return result !== null;
    }

    /**
     * Builds a MongoDB filter from listing filters.
     */
    private buildListingFilter(
        filters: VariantListFilters
    ): QueryFilter<IProductVariantDocument> {
        const filter: QueryFilter<IProductVariantDocument> = {};

        if (filters.product) {
            filter.product = new Types.ObjectId(filters.product);
        }

        if (filters.color && filters.color.trim().length > 0) {
            filter.color = new RegExp(
                this.escapeRegex(filters.color.trim()),
                "i"
            );
        }

        if (filters.size && filters.size.trim().length > 0) {
            filter.size = new RegExp(
                this.escapeRegex(filters.size.trim()),
                "i"
            );
        }

        if (typeof filters.isActive === "boolean") {
            filter.isActive = filters.isActive;
        }

        if (
            typeof filters.minPrice === "number" ||
            typeof filters.maxPrice === "number"
        ) {
            const priceFilter: { $gte?: number; $lte?: number } = {};

            if (typeof filters.minPrice === "number") {
                priceFilter.$gte = filters.minPrice;
            }

            if (typeof filters.maxPrice === "number") {
                priceFilter.$lte = filters.maxPrice;
            }

            filter.price = priceFilter;
        }

        if (filters.search && filters.search.trim().length > 0) {
            const escaped = this.escapeRegex(filters.search.trim());
            const searchRegex = new RegExp(escaped, "i");

            filter.$or = [
                { sku: searchRegex },
                { color: searchRegex },
                { size: searchRegex },
            ];
        }

        return filter;
    }

    /**
     * Resolves sort from explicit sort document or sortBy + sortDirection.
     */
    private resolveSort(
        options: VariantQueryOptions
    ): Record<string, SortOrder> | string {
        if (options.sort) {
            return options.sort;
        }

        const sortBy = options.sortBy ?? "createdAt";
        const direction: SortOrder =
            options.sortDirection === "asc" ? 1 : -1;

        return { [sortBy]: direction };
    }

    /**
     * Escapes user input for safe RegExp usage in search queries.
     */
    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}
