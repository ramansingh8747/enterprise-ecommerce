import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../interfaces/api-response.interface";
import { IProduct } from "../interfaces/product.interface";
import { IProductWithMedia } from "../interfaces/product-media.interface";
import {
    ProductPaginationMeta,
} from "../interfaces/product-listing.interface";
import { ProductService } from "../services/product.service";

/**
 * Shape of multipart files produced by `uploadProductImages`.
 */
interface ProductUploadFiles {
    thumbnail?: Express.Multer.File[];
    images?: Express.Multer.File[];
}

/**
 * Enterprise Product Controller.
 *
 * HTTP adapter for Product endpoints (SRP).
 * Extracts request data / Cloudinary URLs, delegates to ProductService.
 * Contains no business rules, persistence, or direct Cloudinary uploads.
 */
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) {}

    /**
     * POST — create a product.
     */
    async createProduct(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const payload = this.buildProductPayload(req);

            const product = await this.productService.createProduct(payload);

            const response: ApiResponse<IProductWithMedia> = {
                success: true,
                message: "Product created successfully.",
                data: product,
            };

            res.status(201).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — fetch a product by id.
     */
    async getProductById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);

            const product = await this.productService.getProductById(id);

            const response: ApiResponse<IProductWithMedia> = {
                success: true,
                message: "Product fetched successfully.",
                data: product,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — fetch a product by SKU.
     */
    async getProductBySku(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const sku = this.getParam(req.params.sku);

            const product = await this.productService.getProductBySku(sku);

            const response: ApiResponse<IProductWithMedia> = {
                success: true,
                message: "Product fetched successfully.",
                data: product,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — fetch a product by slug.
     */
    async getProductBySlug(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const slug = this.getParam(req.params.slug);

            const product = await this.productService.getProductBySlug(slug);

            const response: ApiResponse<IProductWithMedia> = {
                success: true,
                message: "Product fetched successfully.",
                data: product,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — list products with search, filters, sort, and pagination.
     * Reads query params only; listing rules live in the service layer.
     */
    async getProducts(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await this.productService.listProducts({
                search: this.getQueryString(req.query.search),
                category: this.getQueryString(req.query.category),
                brand: this.getQueryString(req.query.brand),
                status: this.getQueryString(req.query.status),
                stockStatus: this.getQueryString(req.query.stockStatus),
                isFeatured: this.getQueryBoolean(req.query.isFeatured),
                isDigital: this.getQueryBoolean(req.query.isDigital),
                minimumPrice: this.getQueryNumber(req.query.minimumPrice),
                maximumPrice: this.getQueryNumber(req.query.maximumPrice),
                tags: this.getQueryTags(req.query.tags),
                sort: this.getQueryString(req.query.sort),
                page: this.getQueryNumber(req.query.page),
                limit: this.getQueryNumber(req.query.limit),
            });

            const response: ApiResponse<IProductWithMedia[]> & {
                pagination: ProductPaginationMeta;
            } = {
                success: true,
                message: "Products fetched successfully.",
                data: result.data,
                pagination: result.pagination,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PUT — update a product by id.
     */
    async updateProduct(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);
            const payload = this.buildProductPayload(req);

            const product = await this.productService.updateProduct(
                id,
                payload
            );

            const response: ApiResponse<IProductWithMedia> = {
                success: true,
                message: "Product updated successfully.",
                data: product,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * DELETE — delete a product by id.
     */
    async deleteProduct(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);

            const product = await this.productService.deleteProduct(id);

            const response: ApiResponse<IProductWithMedia> = {
                success: true,
                message: "Product deleted successfully.",
                data: product,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Builds product payload from body + Cloudinary upload URLs.
     * Passes only URL strings to the service layer.
     */
    private buildProductPayload(req: Request): Partial<IProduct> {
        const payload: Partial<IProduct> = {
            ...(req.body as Partial<IProduct>),
        };

        const files = this.getUploadedFiles(req);

        const thumbnailFile = files.thumbnail?.[0];
        if (thumbnailFile) {
            payload.thumbnail = this.getCloudinaryUrl(thumbnailFile);
        }

        if (files.images && files.images.length > 0) {
            payload.images = files.images.map((file) =>
                this.getCloudinaryUrl(file)
            );
        }

        return payload;
    }

    /**
     * Reads multipart files attached by `uploadProductImages`.
     */
    private getUploadedFiles(req: Request): ProductUploadFiles {
        if (!req.files || Array.isArray(req.files)) {
            return {};
        }

        return req.files as ProductUploadFiles;
    }

    /**
     * Resolves the Cloudinary secure URL from a Multer file.
     * `multer-storage-cloudinary` stores the URL in `file.path`.
     */
    private getCloudinaryUrl(file: Express.Multer.File): string {
        return file.path;
    }

    /**
     * Normalizes an Express route param to a single string.
     */
    private getParam(value: string | string[]): string {
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
     * Reads tags from comma-separated or repeated query values.
     */
    private getQueryTags(value: unknown): string[] | undefined {
        if (typeof value === "string" && value.trim().length > 0) {
            const tags = value
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

            return tags.length > 0 ? tags : undefined;
        }

        if (Array.isArray(value)) {
            const tags = value
                .filter((item): item is string => typeof item === "string")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

            return tags.length > 0 ? tags : undefined;
        }

        return undefined;
    }
}
