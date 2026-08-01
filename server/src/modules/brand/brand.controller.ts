import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../interfaces/api-response.interface";
import { IBrandDocument } from "../../interfaces/brand.interface";
import {
    BrandListInput,
    BrandPaginationMeta,
    BrandService,
    CreateBrandInput,
    UpdateBrandInput,
} from "./brand.service";

/**
 * Enterprise Brand Controller.
 *
 * HTTP adapter for Brand endpoints (SRP).
 * Extracts request data, delegates to BrandService, returns ApiResponse.
 * Contains no business rules or persistence logic.
 */
export class BrandController {
    constructor(private readonly brandService: BrandService) {}

    /**
     * POST — create a brand.
     * Merges optional Cloudinary logo URL from multipart field `logo`.
     */
    async createBrand(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentUser = this.requireUser(req, res);
            if (!currentUser) {
                return;
            }

            const payload = this.buildBrandPayload(req);

            const brand = await this.brandService.createBrand(
                payload,
                currentUser
            );

            const response: ApiResponse<IBrandDocument> = {
                success: true,
                message: "Brand created successfully.",
                data: brand,
            };

            res.status(201).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — fetch a brand by id.
     */
    async getBrandById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);

            const brand = await this.brandService.getBrandById(id);

            const response: ApiResponse<IBrandDocument> = {
                success: true,
                message: "Brand fetched successfully.",
                data: brand,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — fetch a brand by slug.
     */
    async getBrandBySlug(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const slug = this.getParam(req.params.slug);

            const brand = await this.brandService.getBrandBySlug(slug);

            const response: ApiResponse<IBrandDocument> = {
                success: true,
                message: "Brand fetched successfully.",
                data: brand,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — list brands with search, filters, sort, and pagination.
     * Reads query params only; listing rules live in the service layer.
     */
    async getAllBrands(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await this.brandService.getAllBrands(
                this.buildListInput(req)
            );

            const response: ApiResponse<IBrandDocument[]> & {
                pagination: BrandPaginationMeta;
            } = {
                success: true,
                message: "Brands fetched successfully.",
                data: result.data,
                pagination: result.pagination,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PATCH — update a brand by id.
     * Merges optional Cloudinary logo URL from multipart field `logo`.
     */
    async updateBrand(
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
            const payload = this.buildBrandPayload(req);

            const brand = await this.brandService.updateBrand(
                id,
                payload,
                currentUser
            );

            const response: ApiResponse<IBrandDocument> = {
                success: true,
                message: "Brand updated successfully.",
                data: brand,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * DELETE — soft-delete a brand by id.
     */
    async deleteBrand(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);

            const brand = await this.brandService.deleteBrand(id);

            const response: ApiResponse<IBrandDocument> = {
                success: true,
                message: "Brand deleted successfully.",
                data: brand,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PATCH — update brand status.
     */
    async updateBrandStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);
            const status = req.body?.status as string;

            const brand = await this.brandService.updateBrandStatus(
                id,
                status
            );

            const response: ApiResponse<IBrandDocument> = {
                success: true,
                message: "Brand status updated successfully.",
                data: brand,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Builds brand payload from body + optional Cloudinary logo upload.
     */
    private buildBrandPayload(
        req: Request
    ): CreateBrandInput & UpdateBrandInput {
        const payload = {
            ...(req.body as CreateBrandInput & UpdateBrandInput),
        };

        const logoUrl = this.extractUploadedLogoUrl(req);

        if (logoUrl) {
            payload.logo = logoUrl;
        }

        return payload;
    }

    /**
     * Reads Cloudinary URL from Multer single-file upload (`req.file.path`).
     */
    private extractUploadedLogoUrl(req: Request): string | null {
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
     * Builds listing input from query params (mirrors Category / Product style).
     */
    private buildListInput(req: Request): BrandListInput {
        return {
            keyword:
                this.getQueryString(req.query.keyword) ??
                this.getQueryString(req.query.search),
            status: this.getQueryString(req.query.status),
            isFeatured: this.getQueryBoolean(req.query.isFeatured),
            createdBy: this.getQueryString(req.query.createdBy),
            sortBy: this.getQueryString(req.query.sortBy),
            sortOrder: this.getQueryString(req.query.sortOrder),
            page: this.getQueryNumber(req.query.page),
            limit: this.getQueryNumber(req.query.limit),
            fields: this.getQueryString(req.query.fields),
        };
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
}
