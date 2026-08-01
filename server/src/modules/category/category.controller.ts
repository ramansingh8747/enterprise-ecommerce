import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { ICategoryDocument } from "./category.model";
import {
    CategoryListInput,
    CategoryPaginationMeta,
    CategoryService,
    CategoryTreeNode,
    CreateCategoryInput,
    UpdateCategoryInput,
} from "./category.service";

/**
 * Enterprise Category Controller.
 *
 * HTTP adapter for Category endpoints (SRP).
 * Extracts request data, delegates to CategoryService, returns ApiResponse.
 * Contains no business rules or persistence logic.
 */
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService
    ) {}

    /**
     * POST — create a category.
     */
    async createCategory(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentUser = this.requireUser(req, res);
            if (!currentUser) {
                return;
            }

            const category = await this.categoryService.createCategory(
                req.body as CreateCategoryInput,
                currentUser
            );

            const response: ApiResponse<ICategoryDocument> = {
                success: true,
                message: "Category created successfully.",
                data: category,
            };

            res.status(201).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PUT — update a category by id.
     */
    async updateCategory(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentUser = this.requireUser(req, res);
            if (!currentUser) {
                return;
            }

            const id = this.getParam(req.params.id);

            const category = await this.categoryService.updateCategory(
                id,
                req.body as UpdateCategoryInput,
                currentUser
            );

            const response: ApiResponse<ICategoryDocument> = {
                success: true,
                message: "Category updated successfully.",
                data: category,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * DELETE — delete a category by id.
     */
    async deleteCategory(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);

            const category = await this.categoryService.deleteCategory(id);

            const response: ApiResponse<ICategoryDocument> = {
                success: true,
                message: "Category deleted successfully.",
                data: category,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — fetch a category by id.
     */
    async getCategoryById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);

            const category = await this.categoryService.getCategoryById(id);

            const response: ApiResponse<ICategoryDocument> = {
                success: true,
                message: "Category fetched successfully.",
                data: category,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — fetch a category by slug.
     */
    async getCategoryBySlug(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const slug = this.getParam(req.params.slug);

            const category =
                await this.categoryService.getCategoryBySlug(slug);

            const response: ApiResponse<ICategoryDocument> = {
                success: true,
                message: "Category fetched successfully.",
                data: category,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — list categories with search, filters, sort, and pagination.
     * Reads query params only; listing rules live in the service layer.
     */
    async getAllCategories(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await this.categoryService.listCategories(
                this.buildListInput(req)
            );

            const response: ApiResponse<ICategoryDocument[]> & {
                pagination: CategoryPaginationMeta;
            } = {
                success: true,
                message: "Categories fetched successfully.",
                data: result.data,
                pagination: result.pagination,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — fetch root categories.
     */
    async getRootCategories(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const categories =
                await this.categoryService.getRootCategories();

            const response: ApiResponse<ICategoryDocument[]> = {
                success: true,
                message: "Root categories fetched successfully.",
                data: categories,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — fetch children of a parent category.
     */
    async getChildren(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const parentId = this.getParam(
                req.params.parentId ?? req.params.id
            );

            const categories =
                await this.categoryService.getChildren(parentId);

            const response: ApiResponse<ICategoryDocument[]> = {
                success: true,
                message: "Child categories fetched successfully.",
                data: categories,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — search categories by keyword (same listing envelope as GET /).
     */
    async searchCategories(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await this.categoryService.searchCategories(
                this.buildListInput(req)
            );

            const response: ApiResponse<ICategoryDocument[]> & {
                pagination: CategoryPaginationMeta;
            } = {
                success: true,
                message: "Categories search completed successfully.",
                data: result.data,
                pagination: result.pagination,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PATCH — update category active status.
     */
    async updateCategoryStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);
            const isActive = Boolean(req.body?.isActive);

            const category =
                await this.categoryService.updateCategoryStatus(
                    id,
                    isActive
                );

            const response: ApiResponse<ICategoryDocument> = {
                success: true,
                message: "Category status updated successfully.",
                data: category,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PATCH — update category featured flag.
     */
    async updateFeaturedStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);
            const isFeatured = Boolean(req.body?.isFeatured);

            const category =
                await this.categoryService.updateFeaturedStatus(
                    id,
                    isFeatured
                );

            const response: ApiResponse<ICategoryDocument> = {
                success: true,
                message: "Category featured status updated successfully.",
                data: category,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PATCH — update category sort order.
     */
    async updateSortOrder(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);
            const sortOrder = Number(req.body?.sortOrder);

            const category = await this.categoryService.updateSortOrder(
                id,
                sortOrder
            );

            const response: ApiResponse<ICategoryDocument> = {
                success: true,
                message: "Category sort order updated successfully.",
                data: category,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — fetch nested category tree.
     */
    async getCategoryTree(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const tree = await this.categoryService.getCategoryTree();

            const response: ApiResponse<CategoryTreeNode[]> = {
                success: true,
                message: "Category tree fetched successfully.",
                data: tree,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * POST — upload or replace category image (Cloudinary URL only).
     */
    async uploadCategoryImage(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentUser = this.requireUser(req, res);
            if (!currentUser) {
                return;
            }

            const id = this.getParam(req.params.id);
            const imageUrl = this.extractUploadedImageUrl(req);

            if (!imageUrl) {
                const response: ApiResponse = {
                    success: false,
                    message: "Category image file is required.",
                };

                res.status(400).json(response);
                return;
            }

            const category = await this.categoryService.updateCategory(
                id,
                { image: imageUrl },
                currentUser
            );

            const response: ApiResponse<ICategoryDocument> = {
                success: true,
                message: "Category image uploaded successfully.",
                data: category,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Builds listing input from query params (mirrors Product controller style).
     */
    private buildListInput(req: Request): CategoryListInput {
        return {
            keyword:
                this.getQueryString(req.query.keyword) ??
                this.getQueryString(req.query.search),
            parentCategory: this.getQueryParentCategory(
                req.query.parentCategory
            ),
            level: this.getQueryNumber(req.query.level),
            isActive: this.getQueryBoolean(req.query.isActive),
            isFeatured: this.getQueryBoolean(req.query.isFeatured),
            createdBy: this.getQueryString(req.query.createdBy),
            sortBy: this.getQueryString(req.query.sortBy),
            sortOrder: this.getQueryString(req.query.sortOrder),
            page: this.getQueryNumber(req.query.page),
            limit: this.getQueryNumber(req.query.limit),
            fields: this.getQueryString(req.query.fields),
            populateParent:
                this.getQueryBoolean(req.query.populateParent) === true,
        };
    }

    /**
     * Reads Cloudinary URL from Multer single-file upload (`req.file.path`).
     */
    private extractUploadedImageUrl(req: Request): string | null {
        if (!req.file) {
            return null;
        }

        return this.getCloudinaryUrl(req.file);
    }

    /**
     * Resolves the Cloudinary secure URL from a Multer file.
     * `multer-storage-cloudinary` stores the URL in `file.path`.
     */
    private getCloudinaryUrl(file: Express.Multer.File): string {
        return file.path;
    }

    /**
     * Ensures an authenticated user is present on the request.
     */
    private requireUser(
        req: Request,
        res: Response
    ): { _id: string } | null {
        if (!req.user) {
            const response: ApiResponse = {
                success: false,
                message: "Unauthorized",
            };

            res.status(401).json(response);
            return null;
        }

        return { _id: req.user._id.toString() };
    }

    /**
     * Normalizes an Express route param to a single string.
     */
    private getParam(value: string | string[] | undefined): string {
        if (value === undefined) {
            return "";
        }

        return Array.isArray(value) ? value[0] : value;
    }

    /**
     * Reads an optional string query parameter.
     */
    private getQueryString(value: unknown): string | undefined {
        if (typeof value === "string" && value.trim().length > 0) {
            return value.trim();
        }

        if (Array.isArray(value) && typeof value[0] === "string") {
            const first = value[0].trim();
            return first.length > 0 ? first : undefined;
        }

        return undefined;
    }

    /**
     * Reads an optional numeric query parameter.
     */
    private getQueryNumber(value: unknown): number | undefined {
        const raw = this.getQueryString(value);

        if (raw === undefined) {
            return undefined;
        }

        const parsed = Number(raw);

        if (Number.isNaN(parsed)) {
            return undefined;
        }

        return parsed;
    }

    /**
     * Reads an optional boolean query parameter (`true` / `false`).
     */
    private getQueryBoolean(value: unknown): boolean | undefined {
        const raw = this.getQueryString(value);

        if (raw === undefined) {
            return undefined;
        }

        if (raw.toLowerCase() === "true") {
            return true;
        }

        if (raw.toLowerCase() === "false") {
            return false;
        }

        return undefined;
    }

    /**
     * Reads parentCategory query (`null` string maps to root).
     */
    private getQueryParentCategory(
        value: unknown
    ): string | null | undefined {
        const raw = this.getQueryString(value);

        if (raw === undefined) {
            return undefined;
        }

        if (raw.toLowerCase() === "null") {
            return null;
        }

        return raw;
    }
}
