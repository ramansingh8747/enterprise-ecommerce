import {
    Model,
    QueryFilter,
    SortOrder,
    Types,
    UpdateQuery,
} from "mongoose";
import Category, {
    ICategoryDocument,
} from "./category.model";

/**
 * Optional read options for Category queries.
 * Pagination, sorting, projection, and parent population are caller-driven.
 */
export interface CategoryQueryOptions {
    page?: number;
    limit?: number;
    sort?: Record<string, SortOrder> | string;
    projection?: string | Record<string, 0 | 1>;
    populateParent?: boolean;
}

/**
 * Sortable fields for enterprise category listing.
 */
export type CategoryListSortBy =
    | "name"
    | "sortOrder"
    | "createdAt"
    | "updatedAt";

/**
 * Normalized listing query used by service and repository layers.
 */
export interface CategoryListQuery {
    keyword?: string;
    parentCategory?: string | null;
    level?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    createdBy?: string;
    sortBy: CategoryListSortBy;
    sortDirection: "asc" | "desc";
    page: number;
    limit: number;
    fields?: string;
    populateParent?: boolean;
}

/**
 * Enterprise Category Repository.
 *
 * Data-access layer for Category persistence (SRP).
 * Isolates MongoDB/Mongoose operations from the service layer (DIP).
 * No business rules, validation, or HTTP concerns.
 */
export class CategoryRepository {
    private readonly categoryModel: Model<ICategoryDocument>;

    /**
     * @param categoryModel - Injected Category model (defaults to Category for composition root).
     */
    constructor(categoryModel: Model<ICategoryDocument> = Category) {
        this.categoryModel = categoryModel;
    }

    /**
     * Persists a new category document.
     */
    async create(
        categoryData: Partial<ICategoryDocument>
    ): Promise<ICategoryDocument> {
        return this.categoryModel.create(categoryData);
    }

    /**
     * Finds a category by MongoDB ObjectId.
     * Optionally populates parentCategory.
     */
    async findById(
        id: string | Types.ObjectId,
        options: Pick<CategoryQueryOptions, "populateParent" | "projection"> = {}
    ): Promise<ICategoryDocument | null> {
        let query = this.categoryModel.findById(id);

        if (options.projection) {
            query = query.select(options.projection);
        }

        if (options.populateParent) {
            query = query.populate("parentCategory");
        }

        return query.lean<ICategoryDocument | null>().exec();
    }

    /**
     * Finds a category by unique slug.
     * Optionally populates parentCategory.
     */
    async findBySlug(
        slug: string,
        options: Pick<CategoryQueryOptions, "populateParent" | "projection"> = {}
    ): Promise<ICategoryDocument | null> {
        let query = this.categoryModel.findOne({ slug });

        if (options.projection) {
            query = query.select(options.projection);
        }

        if (options.populateParent) {
            query = query.populate("parentCategory");
        }

        return query.lean<ICategoryDocument | null>().exec();
    }

    /**
     * Finds categories matching the provided filters.
     * Supports optional pagination, sorting, projection, and parent population.
     */
    async findAll(
        filters: QueryFilter<ICategoryDocument> = {},
        options: CategoryQueryOptions = {}
    ): Promise<ICategoryDocument[]> {
        let query = this.categoryModel.find(filters);

        if (options.projection) {
            query = query.select(options.projection);
        }

        if (options.sort) {
            query = query.sort(options.sort);
        }

        if (
            typeof options.page === "number" &&
            typeof options.limit === "number" &&
            options.page > 0 &&
            options.limit > 0
        ) {
            const skip = (options.page - 1) * options.limit;
            query = query.skip(skip).limit(options.limit);
        } else if (typeof options.limit === "number" && options.limit > 0) {
            query = query.limit(options.limit);
        }

        if (options.populateParent) {
            query = query.populate("parentCategory");
        }

        return query.lean<ICategoryDocument[]>().exec();
    }

    /**
     * Lists categories with dynamic search, filters, sort, and pagination.
     * Uses lean() for read performance.
     */
    async findByListing(
        query: CategoryListQuery
    ): Promise<{ items: ICategoryDocument[]; total: number }> {
        const filter = this.buildListingFilter(query);
        const sort = this.buildListingSort(
            query.sortBy,
            query.sortDirection
        );
        const skip = (query.page - 1) * query.limit;
        const projection = this.buildProjection(query.fields);

        let findQuery = this.categoryModel
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(query.limit);

        if (projection) {
            findQuery = findQuery.select(projection);
        }

        if (query.populateParent) {
            findQuery = findQuery.populate("parentCategory");
        }

        const [items, total] = await Promise.all([
            findQuery.lean<ICategoryDocument[]>().exec(),
            this.categoryModel.countDocuments(filter).exec(),
        ]);

        return { items, total };
    }

    /**
     * Updates a category by id and returns the updated document.
     */
    async updateById(
        id: string | Types.ObjectId,
        updateData: UpdateQuery<ICategoryDocument>
    ): Promise<ICategoryDocument | null> {
        return this.categoryModel
            .findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            })
            .lean<ICategoryDocument | null>()
            .exec();
    }

    /**
     * Hard-deletes a category by id and returns the deleted document.
     */
    async deleteById(
        id: string | Types.ObjectId
    ): Promise<ICategoryDocument | null> {
        return this.categoryModel
            .findByIdAndDelete(id)
            .lean<ICategoryDocument | null>()
            .exec();
    }

    /**
     * Returns whether a category with the given name exists.
     */
    async existsByName(name: string): Promise<boolean> {
        const result = await this.categoryModel
            .exists({ name })
            .exec();

        return result !== null;
    }

    /**
     * Returns whether a category with the given slug exists.
     */
    async existsBySlug(slug: string): Promise<boolean> {
        const result = await this.categoryModel
            .exists({ slug })
            .exec();

        return result !== null;
    }

    /**
     * Finds direct child categories of a parent.
     * Ordered by sortOrder ascending by default.
     */
    async findChildren(
        parentCategoryId: string | Types.ObjectId,
        options: CategoryQueryOptions = {}
    ): Promise<ICategoryDocument[]> {
        return this.findAll(
            { parentCategory: parentCategoryId },
            {
                ...options,
                sort: options.sort ?? { sortOrder: 1 },
            }
        );
    }

    /**
     * Finds root categories (parentCategory is null).
     * Ordered by sortOrder ascending by default.
     */
    async findRootCategories(
        options: CategoryQueryOptions = {}
    ): Promise<ICategoryDocument[]> {
        return this.findAll(
            { parentCategory: null },
            {
                ...options,
                sort: options.sort ?? { sortOrder: 1 },
            }
        );
    }

    /**
     * Counts categories matching the provided filters.
     */
    async count(
        filters: QueryFilter<ICategoryDocument> = {}
    ): Promise<number> {
        return this.categoryModel.countDocuments(filters).exec();
    }

    /**
     * Updates only the sortOrder field of a category.
     */
    async updateSortOrder(
        id: string | Types.ObjectId,
        sortOrder: number
    ): Promise<ICategoryDocument | null> {
        return this.updateById(id, { sortOrder });
    }

    /**
     * Updates only the isActive status of a category.
     */
    async updateStatus(
        id: string | Types.ObjectId,
        isActive: boolean
    ): Promise<ICategoryDocument | null> {
        return this.updateById(id, { isActive });
    }

    /**
     * Updates only the isFeatured flag of a category.
     */
    async updateFeatured(
        id: string | Types.ObjectId,
        isFeatured: boolean
    ): Promise<ICategoryDocument | null> {
        return this.updateById(id, { isFeatured });
    }

    /**
     * Finds categories by parent id (alias of findChildren semantics).
     */
    async findByParent(
        parentId: string | Types.ObjectId | null,
        options: CategoryQueryOptions = {}
    ): Promise<ICategoryDocument[]> {
        return this.findAll(
            { parentCategory: parentId },
            {
                ...options,
                sort: options.sort ?? { sortOrder: 1 },
            }
        );
    }

    /**
     * Searches categories by keyword across name, slug, and description.
     */
    async search(
        keyword: string,
        options: CategoryQueryOptions = {}
    ): Promise<ICategoryDocument[]> {
        const escaped = this.escapeRegex(keyword.trim());
        const searchRegex = new RegExp(escaped, "i");

        return this.findAll(
            {
                $or: [
                    { name: searchRegex },
                    { slug: searchRegex },
                    { description: searchRegex },
                ],
            },
            options
        );
    }

    /**
     * Builds a MongoDB filter from listing query parameters.
     */
    private buildListingFilter(
        query: CategoryListQuery
    ): QueryFilter<ICategoryDocument> {
        const filter: QueryFilter<ICategoryDocument> = {};

        if (query.parentCategory !== undefined) {
            filter.parentCategory =
                query.parentCategory === null
                    ? null
                    : new Types.ObjectId(query.parentCategory);
        }

        if (typeof query.level === "number") {
            filter.level = query.level;
        }

        if (typeof query.isActive === "boolean") {
            filter.isActive = query.isActive;
        }

        if (typeof query.isFeatured === "boolean") {
            filter.isFeatured = query.isFeatured;
        }

        if (query.createdBy) {
            filter.createdBy = new Types.ObjectId(query.createdBy);
        }

        if (query.keyword && query.keyword.trim().length > 0) {
            const escaped = this.escapeRegex(query.keyword.trim());
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
     * Maps listing sortBy + direction to a MongoDB sort document.
     */
    private buildListingSort(
        sortBy: CategoryListSortBy,
        sortDirection: "asc" | "desc"
    ): Record<string, SortOrder> {
        const direction: SortOrder = sortDirection === "asc" ? 1 : -1;
        return { [sortBy]: direction };
    }

    /**
     * Converts comma-separated fields into a Mongoose select string.
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
