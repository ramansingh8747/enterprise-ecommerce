import {
    QueryFilter,
    SortOrder,
    Types,
    UpdateQuery,
} from "mongoose";
import {
    BrandStatus,
    IBrand,
    IBrandDocument,
    IBrandModel,
} from "../../interfaces/brand.interface";
import Brand from "../../models/brand.model";

/**
 * Optional read options for Brand queries.
 * Search, filters, pagination, sorting, and projection are caller-driven.
 */
export interface BrandQueryOptions {
    page?: number;
    limit?: number;
    sort?: Record<string, SortOrder> | string;
    projection?: string | Record<string, 0 | 1>;
    keyword?: string;
    status?: BrandStatus;
    isFeatured?: boolean;
    createdBy?: string | Types.ObjectId;
    sortBy?: BrandListSortBy;
    sortDirection?: "asc" | "desc";
}

/**
 * Sortable fields for enterprise brand listing.
 */
export type BrandListSortBy = "name" | "createdAt" | "updatedAt";

/**
 * Normalized listing query used by the service layer.
 */
export interface BrandListQuery {
    keyword?: string;
    status?: BrandStatus;
    isFeatured?: boolean;
    createdBy?: string;
    sortBy: BrandListSortBy;
    sortDirection: "asc" | "desc";
    page: number;
    limit: number;
    fields?: string;
}

/**
 * Enterprise Brand Repository.
 *
 * Data-access layer for Brand persistence (SRP).
 * Isolates MongoDB/Mongoose operations from the service layer (DIP).
 * No business rules, validation, or HTTP concerns.
 *
 * Soft-deleted documents (`deletedAt != null`) are excluded by model query middleware.
 */
export class BrandRepository {
    private readonly brandModel: IBrandModel;

    /**
     * @param brandModel - Injected Brand model (defaults to Brand for composition root).
     */
    constructor(brandModel: IBrandModel = Brand as IBrandModel) {
        this.brandModel = brandModel;
    }

    /**
     * Persists a new brand document.
     */
    async create(brandData: Partial<IBrand>): Promise<IBrandDocument> {
        return this.brandModel.create(brandData);
    }

    /**
     * Finds a brand by MongoDB ObjectId.
     */
    async findById(
        id: string | Types.ObjectId,
        options: Pick<BrandQueryOptions, "projection"> = {}
    ): Promise<IBrandDocument | null> {
        let query = this.brandModel.findById(id);

        if (options.projection) {
            query = query.select(options.projection);
        }

        return query.lean<IBrandDocument | null>().exec();
    }

    /**
     * Finds a brand by unique name.
     */
    async findByName(
        name: string,
        options: Pick<BrandQueryOptions, "projection"> = {}
    ): Promise<IBrandDocument | null> {
        let query = this.brandModel.findOne({ name });

        if (options.projection) {
            query = query.select(options.projection);
        }

        return query.lean<IBrandDocument | null>().exec();
    }

    /**
     * Finds a brand by unique slug.
     */
    async findBySlug(
        slug: string,
        options: Pick<BrandQueryOptions, "projection"> = {}
    ): Promise<IBrandDocument | null> {
        let query = this.brandModel.findOne({ slug });

        if (options.projection) {
            query = query.select(options.projection);
        }

        return query.lean<IBrandDocument | null>().exec();
    }

    /**
     * Finds brands matching filters with optional search, sort, and pagination.
     * Returns items and total for service-layer pagination metadata.
     * Soft-deleted brands are excluded by model query middleware (`deletedAt`).
     */
    async findAll(
        filters: QueryFilter<IBrandDocument> = {},
        options: BrandQueryOptions = {}
    ): Promise<{ items: IBrandDocument[]; total: number }> {
        const filter = this.mergeQueryOptions(filters, options);
        const sort = this.resolveSort(options);
        const projection = this.buildProjection(
            typeof options.projection === "string"
                ? options.projection
                : undefined
        );

        let findQuery = this.brandModel.find(filter).sort(sort);

        if (options.projection && typeof options.projection !== "string") {
            findQuery = findQuery.select(options.projection);
        } else if (projection) {
            findQuery = findQuery.select(projection);
        }

        if (
            typeof options.page === "number" &&
            typeof options.limit === "number" &&
            options.page > 0 &&
            options.limit > 0
        ) {
            const skip = (options.page - 1) * options.limit;
            findQuery = findQuery.skip(skip).limit(options.limit);
        } else if (typeof options.limit === "number" && options.limit > 0) {
            findQuery = findQuery.limit(options.limit);
        }

        const [items, total] = await Promise.all([
            findQuery.lean<IBrandDocument[]>().exec(),
            this.brandModel.countDocuments(filter).exec(),
        ]);

        return { items, total };
    }

    /**
     * Enterprise brand listing with search, filters, sort, and pagination.
     * Mirrors Product/Category `findByListing` (lean reads + total count).
     */
    async findByListing(
        query: BrandListQuery
    ): Promise<{ items: IBrandDocument[]; total: number }> {
        return this.findAll(
            {},
            {
                keyword: query.keyword,
                status: query.status,
                isFeatured: query.isFeatured,
                createdBy: query.createdBy,
                sortBy: query.sortBy,
                sortDirection: query.sortDirection,
                page: query.page,
                limit: query.limit,
                projection: query.fields,
            }
        );
    }

    /**
     * Updates a brand by id and returns the updated document.
     */
    async updateById(
        id: string | Types.ObjectId,
        updateData: UpdateQuery<IBrandDocument>
    ): Promise<IBrandDocument | null> {
        return this.brandModel
            .findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            })
            .lean<IBrandDocument | null>()
            .exec();
    }

    /**
     * Soft-deletes a brand by setting deletedAt (does not remove the document).
     */
    async softDelete(
        id: string | Types.ObjectId
    ): Promise<IBrandDocument | null> {
        return this.brandModel
            .findByIdAndUpdate(
                id,
                { deletedAt: new Date() },
                {
                    new: true,
                    runValidators: true,
                }
            )
            .lean<IBrandDocument | null>()
            .exec();
    }

    /**
     * Updates only the status field of a brand.
     */
    async updateStatus(
        id: string | Types.ObjectId,
        status: BrandStatus
    ): Promise<IBrandDocument | null> {
        return this.updateById(id, { status });
    }

    /**
     * Counts brands matching the provided filter.
     */
    async count(
        filters: QueryFilter<IBrandDocument> = {}
    ): Promise<number> {
        return this.brandModel.countDocuments(filters).exec();
    }

    /**
     * Returns whether at least one brand matches the filter.
     */
    async exists(
        filters: QueryFilter<IBrandDocument>
    ): Promise<boolean> {
        const result = await this.brandModel.exists(filters).exec();
        return result !== null;
    }

    /**
     * Merges service-provided filters with listing options (keyword, status, etc.).
     */
    private mergeQueryOptions(
        filters: QueryFilter<IBrandDocument>,
        options: BrandQueryOptions
    ): QueryFilter<IBrandDocument> {
        const filter: QueryFilter<IBrandDocument> = { ...filters };

        if (options.status) {
            filter.status = options.status;
        }

        if (typeof options.isFeatured === "boolean") {
            filter.isFeatured = options.isFeatured;
        }

        if (options.createdBy) {
            filter.createdBy =
                options.createdBy instanceof Types.ObjectId
                    ? options.createdBy
                    : new Types.ObjectId(options.createdBy);
        }

        if (options.keyword && options.keyword.trim().length > 0) {
            const escaped = this.escapeRegex(options.keyword.trim());
            const searchRegex = new RegExp(escaped, "i");

            filter.$or = [
                { name: searchRegex },
                { slug: searchRegex },
                { description: searchRegex },
            ];
        }

        return filter;
    }

    /**
     * Resolves sort from explicit sort document or sortBy + sortDirection.
     */
    private resolveSort(
        options: BrandQueryOptions
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
     * Converts a comma-separated fields string into a Mongoose select string.
     */
    private buildProjection(fields?: string): string | undefined {
        if (!fields || fields.trim().length === 0) {
            return undefined;
        }

        const selected = fields
            .split(",")
            .map((field) => field.trim())
            .filter((field) => field.length > 0);

        if (selected.length === 0) {
            return undefined;
        }

        return selected.join(" ");
    }

    /**
     * Escapes user input for safe RegExp usage in search queries.
     */
    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}
