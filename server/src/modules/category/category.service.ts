import { Document, Types } from "mongoose";
import { ProductRepository } from "../../repositories/product.repository";
import { CATEGORY_DEFAULTS } from "./constants/category.constants";
import {
    CategoryListQuery,
    CategoryListSortBy,
    CategoryQueryOptions,
    CategoryRepository,
} from "./category.repository";
import { ICategoryDocument } from "./category.model";

/**
 * Default listing page size (aligned with Product module).
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const CATEGORY_SORT_OPTIONS: readonly CategoryListSortBy[] = [
    "name",
    "sortOrder",
    "createdAt",
    "updatedAt",
] as const;

/**
 * Authenticated actor performing category mutations.
 */
export interface CategoryActor {
    _id: string | Types.ObjectId;
}

/**
 * Raw listing input accepted from the controller (pre-normalization).
 */
export interface CategoryListInput {
    keyword?: string;
    parentCategory?: string | null;
    level?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    createdBy?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
    fields?: string;
    populateParent?: boolean;
}

/**
 * Pagination metadata returned by GET /categories.
 */
export interface CategoryPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

/**
 * Enterprise category listing result.
 */
export interface CategoryListResult {
    data: ICategoryDocument[];
    pagination: CategoryPaginationMeta;
}

/**
 * Inbound create payload for Category use cases.
 */
export interface CreateCategoryInput {
    name: string;
    slug?: string;
    description?: string;
    image?: string;
    parentCategory?: string | Types.ObjectId | null;
    sortOrder?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    metaTitle?: string;
    metaDescription?: string;
}

/**
 * Inbound update payload for Category use cases.
 */
export interface UpdateCategoryInput {
    name?: string;
    slug?: string;
    description?: string;
    image?: string;
    parentCategory?: string | Types.ObjectId | null;
    sortOrder?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    metaTitle?: string;
    metaDescription?: string;
}

/**
 * Query shape for listing categories.
 */
export interface GetAllCategoriesQuery {
    filters?: {
        parentCategory?: string | Types.ObjectId | null;
        isActive?: boolean;
        isFeatured?: boolean;
        level?: number;
    };
    options?: CategoryQueryOptions;
}

/**
 * Tree node returned by getCategoryTree().
 * Plain lean-compatible shape (not a Mongoose Document).
 */
export type CategoryTreeNode = Omit<ICategoryDocument, keyof Document> & {
    children: CategoryTreeNode[];
};

/**
 * Enterprise Category Service.
 *
 * Application layer for Category use cases (SRP).
 * Enforces taxonomy rules and delegates persistence to CategoryRepository (DIP).
 * Contains no HTTP, validation-schema, or direct Mongoose query logic.
 */
export class CategoryService {
    constructor(
        private readonly categoryRepository: CategoryRepository,
        private readonly productRepository: ProductRepository
    ) {}

    /**
     * Creates a category after enforcing uniqueness and hierarchy rules.
     */
    async createCategory(
        data: CreateCategoryInput,
        currentUser: CategoryActor
    ): Promise<ICategoryDocument> {
        const name = data.name.trim();
        const parentCategoryId = this.normalizeParentId(data.parentCategory);

        await this.assertNameUniqueWithinParent(name, parentCategoryId);

        const slug = this.resolveSlug(data.slug, name);
        await this.assertSlugUnique(slug);

        const hierarchy = await this.resolveHierarchy(parentCategoryId, name);

        return this.categoryRepository.create({
            name,
            slug,
            description: data.description,
            image: data.image,
            parentCategory: hierarchy.parentCategory,
            level: hierarchy.level,
            path: hierarchy.path,
            sortOrder: data.sortOrder ?? CATEGORY_DEFAULTS.SORT_ORDER,
            isActive: data.isActive ?? CATEGORY_DEFAULTS.IS_ACTIVE,
            isFeatured: data.isFeatured ?? false,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            createdBy: this.toObjectId(currentUser._id),
        });
    }

    /**
     * Updates a category after validating existence, uniqueness, and hierarchy.
     */
    async updateCategory(
        id: string,
        data: UpdateCategoryInput,
        currentUser: CategoryActor
    ): Promise<ICategoryDocument> {
        const existing = await this.categoryRepository.findById(id);

        if (!existing) {
            throw new Error("Category not found.");
        }

        const name = data.name?.trim() ?? existing.name;
        const parentCategoryId =
            data.parentCategory !== undefined
                ? this.normalizeParentId(data.parentCategory)
                : this.normalizeParentId(existing.parentCategory);

        if (parentCategoryId && parentCategoryId === id) {
            throw new Error("A category cannot be its own parent.");
        }

        await this.assertNameUniqueWithinParent(name, parentCategoryId, id);

        const slug =
            data.slug !== undefined
                ? this.resolveSlug(data.slug, name)
                : existing.slug;

        if (slug !== existing.slug) {
            await this.assertSlugUnique(slug);
        }

        const hierarchy = await this.resolveHierarchy(parentCategoryId, name);

        const updated = await this.categoryRepository.updateById(id, {
            name,
            slug,
            description:
                data.description !== undefined
                    ? data.description
                    : existing.description,
            image: data.image !== undefined ? data.image : existing.image,
            parentCategory: hierarchy.parentCategory,
            level: hierarchy.level,
            path: hierarchy.path,
            sortOrder:
                data.sortOrder !== undefined
                    ? data.sortOrder
                    : existing.sortOrder,
            isActive:
                data.isActive !== undefined
                    ? data.isActive
                    : existing.isActive,
            isFeatured:
                data.isFeatured !== undefined
                    ? data.isFeatured
                    : existing.isFeatured,
            metaTitle:
                data.metaTitle !== undefined
                    ? data.metaTitle
                    : existing.metaTitle,
            metaDescription:
                data.metaDescription !== undefined
                    ? data.metaDescription
                    : existing.metaDescription,
            updatedBy: this.toObjectId(currentUser._id),
        });

        if (!updated) {
            throw new Error("Category not found.");
        }

        return updated;
    }

    /**
     * Deletes a category when it has no children and no linked products.
     */
    async deleteCategory(id: string): Promise<ICategoryDocument> {
        const existing = await this.categoryRepository.findById(id);

        if (!existing) {
            throw new Error("Category not found.");
        }

        const children = await this.categoryRepository.findChildren(id);

        if (children.length > 0) {
            throw new Error(
                "Cannot delete category while child categories exist."
            );
        }

        const hasProducts = await this.productRepository.exists({
            category: id,
        });

        if (hasProducts) {
            throw new Error(
                "Cannot delete category while products are linked to it."
            );
        }

        const deleted = await this.categoryRepository.deleteById(id);

        if (!deleted) {
            throw new Error("Category not found.");
        }

        return deleted;
    }

    /**
     * Retrieves a category by id.
     */
    async getCategoryById(id: string): Promise<ICategoryDocument> {
        const category = await this.categoryRepository.findById(id, {
            populateParent: true,
        });

        if (!category) {
            throw new Error("Category not found.");
        }

        return category;
    }

    /**
     * Retrieves a category by slug.
     */
    async getCategoryBySlug(slug: string): Promise<ICategoryDocument> {
        const category = await this.categoryRepository.findBySlug(slug, {
            populateParent: true,
        });

        if (!category) {
            throw new Error("Category not found.");
        }

        return category;
    }

    /**
     * Retrieves categories using caller-provided filters and read options.
     * Preserved for non-listing consumers — no pagination/search applied.
     */
    async getAllCategories(
        query: GetAllCategoriesQuery = {}
    ): Promise<ICategoryDocument[]> {
        return this.categoryRepository.findAll(
            query.filters ?? {},
            query.options ?? {}
        );
    }

    /**
     * Enterprise category listing with search, filters, sort, and pagination.
     */
    async listCategories(
        rawQuery: CategoryListInput
    ): Promise<CategoryListResult> {
        const query = this.normalizeListQuery(rawQuery);
        const { items, total } =
            await this.categoryRepository.findByListing(query);

        const totalPages =
            total === 0 ? 0 : Math.ceil(total / query.limit);

        return {
            data: items,
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
     * Retrieves root categories (parentCategory is null).
     */
    async getRootCategories(): Promise<ICategoryDocument[]> {
        return this.categoryRepository.findRootCategories();
    }

    /**
     * Retrieves direct children of a parent category.
     */
    async getChildren(parentId: string): Promise<ICategoryDocument[]> {
        const parent = await this.categoryRepository.findById(parentId);

        if (!parent) {
            throw new Error("Parent category not found.");
        }

        return this.categoryRepository.findChildren(parentId);
    }

    /**
     * Searches categories by keyword with the same listing envelope as GET /.
     */
    async searchCategories(
        rawQuery: CategoryListInput
    ): Promise<CategoryListResult> {
        const keyword = rawQuery.keyword?.trim();

        if (!keyword) {
            throw new Error("Search keyword is required.");
        }

        return this.listCategories({
            ...rawQuery,
            keyword,
        });
    }

    /**
     * Updates category active status.
     */
    async updateCategoryStatus(
        id: string,
        isActive: boolean
    ): Promise<ICategoryDocument> {
        await this.assertCategoryExists(id);

        const updated = await this.categoryRepository.updateStatus(
            id,
            isActive
        );

        if (!updated) {
            throw new Error("Category not found.");
        }

        return updated;
    }

    /**
     * Updates category featured flag.
     */
    async updateFeaturedStatus(
        id: string,
        isFeatured: boolean
    ): Promise<ICategoryDocument> {
        await this.assertCategoryExists(id);

        const updated = await this.categoryRepository.updateFeatured(
            id,
            isFeatured
        );

        if (!updated) {
            throw new Error("Category not found.");
        }

        return updated;
    }

    /**
     * Updates category sort order.
     */
    async updateSortOrder(
        id: string,
        sortOrder: number
    ): Promise<ICategoryDocument> {
        if (typeof sortOrder !== "number" || Number.isNaN(sortOrder)) {
            throw new Error("sortOrder must be a valid number.");
        }

        await this.assertCategoryExists(id);

        const updated = await this.categoryRepository.updateSortOrder(
            id,
            sortOrder
        );

        if (!updated) {
            throw new Error("Category not found.");
        }

        return updated;
    }

    /**
     * Builds a nested category tree from all categories.
     */
    async getCategoryTree(): Promise<CategoryTreeNode[]> {
        const categories = await this.categoryRepository.findAll(
            {},
            { sort: { sortOrder: 1, name: 1 } }
        );

        return this.buildCategoryTree(categories);
    }

    /**
     * Applies listing business rules: defaults, bounds, and sort checks.
     */
    private normalizeListQuery(rawQuery: CategoryListInput): CategoryListQuery {
        return {
            keyword: rawQuery.keyword?.trim() || undefined,
            parentCategory: rawQuery.parentCategory,
            level: rawQuery.level,
            isActive: rawQuery.isActive,
            isFeatured: rawQuery.isFeatured,
            createdBy: rawQuery.createdBy,
            sortBy: this.resolveSortBy(rawQuery.sortBy),
            sortDirection: this.resolveSortDirection(rawQuery.sortOrder),
            page: this.resolvePage(rawQuery.page),
            limit: this.resolveLimit(rawQuery.limit),
            fields: rawQuery.fields?.trim() || undefined,
            populateParent: rawQuery.populateParent === true,
        };
    }

    private resolveSortBy(sortBy?: string): CategoryListSortBy {
        if (!sortBy) {
            return "sortOrder";
        }

        if (
            (CATEGORY_SORT_OPTIONS as readonly string[]).includes(sortBy)
        ) {
            return sortBy as CategoryListSortBy;
        }

        throw new Error(
            `Invalid sortBy. Allowed: ${CATEGORY_SORT_OPTIONS.join(", ")}.`
        );
    }

    private resolveSortDirection(sortOrder?: string): "asc" | "desc" {
        if (!sortOrder) {
            return "asc";
        }

        const normalized = sortOrder.trim().toLowerCase();

        if (normalized === "asc" || normalized === "desc") {
            return normalized;
        }

        throw new Error("sortOrder must be either asc or desc.");
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

    /**
     * Ensures a category exists.
     */
    private async assertCategoryExists(id: string): Promise<void> {
        const existing = await this.categoryRepository.findById(id);

        if (!existing) {
            throw new Error("Category not found.");
        }
    }

    /**
     * Enforces name uniqueness within the same parent (including root).
     */
    private async assertNameUniqueWithinParent(
        name: string,
        parentCategoryId: string | null,
        excludeId?: string
    ): Promise<void> {
        const matches = await this.categoryRepository.findAll({
            name,
            parentCategory: parentCategoryId,
        });

        const conflict = matches.find((category) => {
            if (!excludeId) {
                return true;
            }

            return category._id.toString() !== excludeId;
        });

        if (conflict) {
            if (parentCategoryId === null) {
                throw new Error(
                    "A root category with this name already exists."
                );
            }

            throw new Error(
                "A category with this name already exists under the same parent."
            );
        }
    }

    /**
     * Enforces global slug uniqueness.
     */
    private async assertSlugUnique(slug: string): Promise<void> {
        const exists = await this.categoryRepository.existsBySlug(slug);

        if (exists) {
            throw new Error("Category with this slug already exists.");
        }
    }

    /**
     * Resolves parent, level, and materialized path for a category name.
     */
    private async resolveHierarchy(
        parentCategoryId: string | null,
        categoryName: string
    ): Promise<{
        parentCategory: Types.ObjectId | null;
        level: number;
        path: string;
    }> {
        if (!parentCategoryId) {
            return {
                parentCategory: null,
                level: CATEGORY_DEFAULTS.LEVEL,
                path: categoryName,
            };
        }

        const parent = await this.categoryRepository.findById(parentCategoryId);

        if (!parent) {
            throw new Error("Parent category not found.");
        }

        const parentPath =
            parent.path && parent.path.trim().length > 0
                ? parent.path
                : parent.name;

        return {
            parentCategory: parent._id,
            level: parent.level + 1,
            path: `${parentPath}/${categoryName}`,
        };
    }

    /**
     * Uses provided slug or generates one from the category name.
     */
    private resolveSlug(slug: string | undefined, name: string): string {
        const source = slug && slug.trim().length > 0 ? slug : name;
        const generated = this.generateSlug(source);

        if (!generated) {
            throw new Error("Unable to generate a valid category slug.");
        }

        return generated;
    }

    /**
     * Generates a URL-safe slug from raw text.
     */
    private generateSlug(value: string): string {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    /**
     * Normalizes parentCategory input to a string id or null.
     */
    private normalizeParentId(
        parentCategory?: string | Types.ObjectId | null
    ): string | null {
        if (
            parentCategory === undefined ||
            parentCategory === null ||
            parentCategory === ""
        ) {
            return null;
        }

        return parentCategory.toString();
    }

    /**
     * Converts an actor id into a Mongo ObjectId.
     */
    private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
        return id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    }

    /**
     * Assembles a nested tree from a flat category list.
     */
    private buildCategoryTree(
        categories: ICategoryDocument[]
    ): CategoryTreeNode[] {
        const nodes = new Map<string, CategoryTreeNode>();
        const roots: CategoryTreeNode[] = [];

        for (const category of categories) {
            nodes.set(category._id.toString(), {
                ...(category as unknown as Omit<CategoryTreeNode, "children">),
                children: [],
            });
        }

        for (const category of categories) {
            const node = nodes.get(category._id.toString());

            if (!node) {
                continue;
            }

            const parentId = category.parentCategory
                ? category.parentCategory.toString()
                : null;

            if (parentId && nodes.has(parentId)) {
                nodes.get(parentId)!.children.push(node);
            } else {
                roots.push(node);
            }
        }

        return roots;
    }
}
