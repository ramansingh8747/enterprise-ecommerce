import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../interfaces/api-response.interface";
import {
    CreateVariantInput,
    UpdateVariantInput,
    VariantListInput,
    VariantPaginationMeta,
    VariantResponse,
    VariantService,
    VariantStockMutationResult,
} from "./variant.service";

/**
 * Enterprise Product Variant Controller.
 *
 * HTTP adapter for Variant endpoints (SRP).
 * Extracts request data, delegates to VariantService, returns ApiResponse.
 * Contains no business rules or persistence logic.
 */
export class VariantController {
    constructor(private readonly variantService: VariantService) {}

    /**
     * POST — create a variant.
     */
    async createVariant(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentUser = this.requireUser(req, res);
            if (!currentUser) {
                return;
            }

            const payload = req.body as CreateVariantInput;

            const variant = await this.variantService.createVariant(
                payload,
                currentUser
            );

            const response: ApiResponse<VariantResponse> = {
                success: true,
                message: "Variant created successfully.",
                data: variant,
            };

            res.status(201).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — fetch a variant by id.
     */
    async getVariantById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);

            const variant = await this.variantService.getVariantById(id);

            const response: ApiResponse<VariantResponse> = {
                success: true,
                message: "Variant fetched successfully.",
                data: variant,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — fetch a variant by SKU.
     */
    async getVariantBySku(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const sku = this.getParam(req.params.sku);

            const variant = await this.variantService.getVariantBySku(sku);

            const response: ApiResponse<VariantResponse> = {
                success: true,
                message: "Variant fetched successfully.",
                data: variant,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — list variants with search, filters, sort, and pagination.
     */
    async getAllVariants(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await this.variantService.getAllVariants(
                this.buildListInput(req)
            );

            const response: ApiResponse<VariantResponse[]> & {
                pagination: VariantPaginationMeta;
            } = {
                success: true,
                message: "Variants fetched successfully.",
                data: result.data,
                pagination: result.pagination,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PATCH/PUT — update a variant by id.
     */
    async updateVariant(
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
            const payload = req.body as UpdateVariantInput;

            const variant = await this.variantService.updateVariant(
                id,
                payload,
                currentUser
            );

            const response: ApiResponse<VariantResponse> = {
                success: true,
                message: "Variant updated successfully.",
                data: variant,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * DELETE — delete a variant by id.
     */
    async deleteVariant(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);

            const variant = await this.variantService.deleteVariant(id);

            const response: ApiResponse<VariantResponse> = {
                success: true,
                message: "Variant deleted successfully.",
                data: variant,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * GET — list variants belonging to a Product.
     */
    async getVariantsByProduct(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const productId = this.getParam(
                req.params.productId ?? req.params.id
            );

            const variants =
                await this.variantService.getVariantsByProduct(productId);

            const response: ApiResponse<VariantResponse[]> = {
                success: true,
                message: "Product variants fetched successfully.",
                data: variants,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PATCH — update variant stock by id.
     * Body:
     * - `{ stock }` → setStock (default)
     * - `{ operation: "increase"|"decrease", quantity }` → delta ops
     * - `{ operation: "set", stock }` → absolute set
     */
    async updateVariantStock(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const id = this.getParam(req.params.id);
            const operation = String(req.body?.operation || "set")
                .trim()
                .toLowerCase();

            let result;

            if (operation === "increase") {
                result = await this.variantService.increaseStock(
                    id,
                    Number(req.body?.quantity)
                );
            } else if (operation === "decrease") {
                result = await this.variantService.decreaseStock(
                    id,
                    Number(req.body?.quantity)
                );
            } else {
                result = await this.variantService.setStock(
                    id,
                    Number(req.body?.stock)
                );
            }

            const response: ApiResponse<VariantStockMutationResult> = {
                success: true,
                message: "Variant stock updated successfully.",
                data: result,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Builds listing input from query params (mirrors Brand / Product style).
     */
    private buildListInput(req: Request): VariantListInput {
        return {
            product: this.getQueryString(req.query.product),
            color: this.getQueryString(req.query.color),
            size: this.getQueryString(req.query.size),
            isActive: this.getQueryBoolean(req.query.isActive),
            minPrice: this.getQueryNumber(req.query.minPrice),
            maxPrice: this.getQueryNumber(req.query.maxPrice),
            search: this.getQueryString(req.query.search),
            sortBy: this.getQueryString(req.query.sortBy),
            sortOrder: this.getQueryString(req.query.sortOrder),
            page: this.getQueryNumber(req.query.page),
            limit: this.getQueryNumber(req.query.limit),
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
