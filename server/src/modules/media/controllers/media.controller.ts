import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../interfaces/api-response.interface";
import {
    IProductMediaReplaceResult,
    IProductMediaUploadResponse,
    IProductPrimaryMediaResponse,
} from "../interfaces/media-upload-result.interface";
import { IMulterMemoryFile } from "../interfaces/upload-request.interface";
import { MediaService } from "../services/media.service";

/**
 * Enterprise Media Controller (Step 13.7 — Product multi-image upload).
 *
 * HTTP adapter only — delegates upload orchestration to MediaService.
 */
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    /**
     * POST /products/:productId/media — upload one or more product images.
     */
    async uploadProductMedia(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const productId = this.getParam(req.params.productId);
            const files = this.getUploadedImages(req);
            const createdBy = req.user?._id
                ? String(req.user._id)
                : undefined;

            const data = await this.mediaService.uploadProductImages({
                productId,
                files,
                createdBy,
            });

            const response: ApiResponse<IProductMediaUploadResponse> = {
                success: true,
                message: "Images uploaded successfully.",
                data,
            };

            res.status(201).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PATCH /products/:productId/media/:mediaId/primary — set primary image.
     */
    async setProductPrimaryMedia(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const productId = this.getParam(req.params.productId);
            const mediaId = this.getParam(req.params.mediaId);

            const data = await this.mediaService.setProductPrimaryMedia(
                productId,
                mediaId
            );

            const response: ApiResponse<IProductPrimaryMediaResponse> = {
                success: true,
                message: "Primary image updated successfully.",
                data,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * DELETE /products/:productId/media/:mediaId — delete a product image.
     */
    async deleteProductMedia(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const productId = this.getParam(req.params.productId);
            const mediaId = this.getParam(req.params.mediaId);

            await this.mediaService.deleteProductMedia(productId, mediaId);

            const response: ApiResponse = {
                success: true,
                message: "Image deleted successfully.",
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * PUT /products/:productId/media/:mediaId — replace a product image.
     */
    async replaceProductMedia(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const productId = this.getParam(req.params.productId);
            const mediaId = this.getParam(req.params.mediaId);
            const file = this.getUploadedReplaceImage(req);
            const updatedBy = req.user?._id
                ? String(req.user._id)
                : undefined;

            const data = await this.mediaService.replaceProductMedia(
                productId,
                mediaId,
                file,
                updatedBy
            );

            const response: ApiResponse<IProductMediaReplaceResult> = {
                success: true,
                message: "Image replaced successfully.",
                data,
            };

            res.status(200).json(response);
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Placeholder — POST create / upload media (generic).
     */
    async createMedia(
        _req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            throw new Error(
                "MediaController.createMedia is not implemented yet."
            );
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Placeholder — GET media by id.
     */
    async getMediaById(
        _req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            throw new Error(
                "MediaController.getMediaById is not implemented yet."
            );
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Placeholder — GET product media list.
     */
    async getProductMedia(
        _req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            throw new Error(
                "MediaController.getProductMedia is not implemented yet."
            );
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Placeholder — PATCH set primary / reorder / update.
     */
    async updateMedia(
        _req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            throw new Error(
                "MediaController.updateMedia is not implemented yet."
            );
        } catch (error: unknown) {
            next(error);
        }
    }

    /**
     * Placeholder — DELETE media (generic).
     */
    async deleteMedia(
        _req: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            throw new Error(
                "MediaController.deleteMedia is not implemented yet. Use deleteProductMedia."
            );
        } catch (error: unknown) {
            next(error);
        }
    }

    private getParam(value: string | string[] | undefined): string {
        if (Array.isArray(value)) {
            return value[0] ?? "";
        }
        return value ?? "";
    }

    private getUploadedImages(req: Request): IMulterMemoryFile[] {
        if (!req.files) {
            return [];
        }

        if (Array.isArray(req.files)) {
            return req.files as IMulterMemoryFile[];
        }

        const named = req.files as {
            images?: Express.Multer.File[];
        };

        return (named.images ?? []) as IMulterMemoryFile[];
    }

    private getUploadedReplaceImage(req: Request): IMulterMemoryFile {
        if (!req.file) {
            throw new Error("Invalid image. An image file is required.");
        }

        return req.file as IMulterMemoryFile;
    }
}
