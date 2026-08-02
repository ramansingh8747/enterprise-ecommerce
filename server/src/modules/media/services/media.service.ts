/**
 * Enterprise Media Service — upload orchestration (Steps 13.4–13.7).
 *
 * Coordinates: Multer file → UploadValidator → StorageProvider → map → MediaRepository.
 * Product multi-upload associates Media refs on Product ($addToSet) with rollback.
 * Depends on IStorageProvider (DIP) — not Cloudinary directly.
 */

import mongoose, { Types } from "mongoose";
import { ICreateMedia } from "../interfaces/media.interface";
import {
    IMediaUploadResult,
    IProductMediaReplaceResult,
    IProductMediaUploadResponse,
    IProductPrimaryMediaResponse,
} from "../interfaces/media-upload-result.interface";
import { IStorageProvider } from "../interfaces/storage-provider.interface";
import {
    IMediaUploadManyRequest,
    IMediaUploadRequest,
    IMulterMemoryFile,
} from "../interfaces/upload-request.interface";
import { IMediaDocument } from "../models/media.model";
import { MEDIA_DEFAULTS, MEDIA_STORAGE_FOLDERS } from "../media.constants";
import { MediaRepository } from "../repositories/media.repository";
import { MediaStorageProvider } from "../types/media.types";
import { extractFileExtension } from "../validators/extension.validator";
import { normalizeFilename } from "../validators/filename.validator";
import { uploadValidator } from "../validators/upload.validator";
import { ProductRepository } from "../../../repositories/product.repository";

export class MediaService {
    constructor(
        private readonly mediaRepository: MediaRepository,
        private readonly storageProvider: IStorageProvider,
        private readonly productRepository: ProductRepository = new ProductRepository()
    ) {}

    /**
     * Uploads a single Multer memory file, persists a Media document, returns a DTO.
     */
    async uploadMedia(
        request: IMediaUploadRequest
    ): Promise<IMediaUploadResult> {
        this.assertValidProductId(request.productId);

        const { normalizedFilename } = uploadValidator.assertFile(
            request.file
        );

        const normalizedRequest: IMediaUploadRequest = {
            ...request,
            file: {
                ...request.file,
                originalname: normalizedFilename ?? request.file.originalname,
            },
        };

        const createPayload = await this.uploadAndMap(normalizedRequest);
        const document = await this.mediaRepository.create(createPayload);

        return this.toUploadResult(document);
    }

    /**
     * Uploads multiple Multer memory files and persists Media documents.
     * Structural multi-file support — count validated via MAX_PRODUCT_IMAGES.
     */
    async uploadManyMedia(
        request: IMediaUploadManyRequest
    ): Promise<IMediaUploadResult[]> {
        this.assertValidProductId(request.productId);
        uploadValidator.assertFiles(request.files);

        const payloads: ICreateMedia[] = [];

        for (let index = 0; index < request.files.length; index += 1) {
            const file = request.files[index];
            const normalized =
                normalizeFilename(file.originalname) ?? file.originalname;

            const payload = await this.uploadAndMap({
                productId: request.productId,
                file: {
                    ...file,
                    originalname: normalized,
                },
                createdBy: request.createdBy,
                folder: request.folder,
                storageOptions: request.storageOptions,
                displayOrder: index,
                isPrimary: false,
            });

            payloads.push(payload);
        }

        const documents = await this.mediaRepository.createMany(payloads);
        return documents.map((doc) => this.toUploadResult(doc));
    }

    /**
     * Product multi-image upload (Step 13.7).
     *
     * Validates Product + files, uploads to storage, persists Media,
     * associates Product.media ($addToSet), rolls back on persistence failure.
     */
    async uploadProductImages(request: {
        productId: string;
        files: IMulterMemoryFile[];
        createdBy?: string;
    }): Promise<IProductMediaUploadResponse> {
        const productId = String(request.productId);
        this.assertValidProductId(productId);

        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error("Product not found.");
        }

        const existingCount =
            await this.mediaRepository.countByProduct(productId);
        const hasPrimary =
            await this.mediaRepository.hasPrimaryForProduct(productId);
        const maxDisplayOrder =
            await this.mediaRepository.getMaxDisplayOrder(productId);

        uploadValidator.assertFiles(request.files, {
            existingCount,
        });

        const storagePublicIds: string[] = [];
        const payloads: ICreateMedia[] = [];
        const startOrder = maxDisplayOrder + 1;
        let persistedIds: string[] = [];

        try {
            for (let index = 0; index < request.files.length; index += 1) {
                const file = request.files[index];
                const normalized =
                    normalizeFilename(file.originalname) ?? file.originalname;

                const payload = await this.uploadAndMap({
                    productId,
                    file: {
                        ...file,
                        originalname: normalized,
                    },
                    createdBy: request.createdBy,
                    folder: MEDIA_STORAGE_FOLDERS.PRODUCTS,
                    displayOrder: startOrder + index,
                    isPrimary: !hasPrimary && index === 0,
                });

                if (payload.publicId) {
                    storagePublicIds.push(payload.publicId);
                }

                payloads.push(payload);
            }

            const documents: IMediaDocument[] = [];
            for (const payload of payloads) {
                const document = await this.mediaRepository.create(payload);
                documents.push(document);
                persistedIds.push(String(document._id));
            }

            const associated =
                await this.productRepository.addMediaReferences(
                    productId,
                    persistedIds
                );

            if (!associated) {
                throw new Error("Product not found.");
            }

            return {
                productId,
                uploaded: documents.map((doc) => ({
                    id: String(doc._id),
                    url: doc.secureUrl ?? doc.url,
                    secureUrl: doc.secureUrl,
                    isPrimary: doc.isPrimary,
                    displayOrder: doc.displayOrder,
                })),
            };
        } catch (error: unknown) {
            if (persistedIds.length > 0) {
                await this.rollbackPersistedMedia(
                    persistedIds,
                    storagePublicIds
                );
            } else {
                await this.rollbackStorageOnly(storagePublicIds);
            }
            throw error;
        }
    }

    /**
     * Returns a media document by id (read helper for future Product integration).
     */
    async getMediaById(id: string): Promise<IMediaDocument | null> {
        return this.mediaRepository.findById(id);
    }

    /**
     * Lists media for a product (read helper for future Product integration).
     */
    async getProductMedia(productId: string): Promise<IMediaDocument[]> {
        return this.mediaRepository.findByProduct(productId);
    }

    /**
     * Sets a Product Media item as the sole primary image (Step 13.8).
     * Unsets any existing primary, then marks the selected media as primary.
     */
    async setProductPrimaryMedia(
        productId: string,
        mediaId: string
    ): Promise<IProductPrimaryMediaResponse> {
        this.assertValidProductId(productId);

        if (!Types.ObjectId.isValid(mediaId)) {
            throw new Error("Media not found.");
        }

        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error("Product not found.");
        }

        const media = await this.mediaRepository.findById(mediaId);
        if (!media) {
            throw new Error("Media not found.");
        }

        if (String(media.productId) !== String(productId)) {
            throw new Error(
                "Invalid request. Media does not belong to Product."
            );
        }

        if (media.isPrimary) {
            throw new Error("Media is already the primary image.");
        }

        await this.swapPrimaryMedia(productId, mediaId);

        return {
            productId: String(productId),
            mediaId: String(mediaId),
            isPrimary: true,
        };
    }

    /**
     * @deprecated Prefer setProductPrimaryMedia(productId, mediaId).
     */
    async setPrimaryMedia(_id: string): Promise<IMediaUploadResult> {
        throw new Error(
            "MediaService.setPrimaryMedia requires productId. Use setProductPrimaryMedia."
        );
    }

    /**
     * Placeholder — reorder logic lands in a later step.
     */
    async reorderMedia(_orderedIds: string[]): Promise<IMediaUploadResult[]> {
        throw new Error("MediaService.reorderMedia is not implemented yet.");
    }

    /**
     * Deletes a Product Media image (storage + DB + Product ref) — Step 13.9.
     * Reassigns primary and re-sequences displayOrder when needed.
     */
    async deleteProductMedia(
        productId: string,
        mediaId: string
    ): Promise<void> {
        const { media } = await this.assertProductMediaOwnership(
            productId,
            mediaId
        );

        const wasPrimary = media.isPrimary;
        const oldPublicId = media.publicId?.trim();

        if (oldPublicId) {
            try {
                await this.storageProvider.delete(oldPublicId);
            } catch {
                throw new Error(
                    "Storage deletion failed. Image was not deleted."
                );
            }
        }

        const deleted = await this.mediaRepository.deleteById(mediaId);
        if (!deleted) {
            throw new Error("Media not found.");
        }

        await this.productRepository.removeMediaReference(productId, mediaId);

        if (wasPrimary) {
            const next =
                await this.mediaRepository.findNextPrimaryCandidate(productId);
            if (next) {
                await this.mediaRepository.setPrimaryById(String(next._id));
            }
        }

        await this.mediaRepository.resequenceDisplayOrder(productId);
    }

    /**
     * Replaces a Product Media asset while preserving identity and rules — Step 13.9.
     */
    async replaceProductMedia(
        productId: string,
        mediaId: string,
        file: IMulterMemoryFile,
        updatedBy?: string
    ): Promise<IProductMediaReplaceResult> {
        const { media } = await this.assertProductMediaOwnership(
            productId,
            mediaId
        );

        const { normalizedFilename } = uploadValidator.assertFile(file);
        const normalizedFile: IMulterMemoryFile = {
            ...file,
            originalname: normalizedFilename ?? file.originalname,
        };

        const oldPublicId = media.publicId?.trim();
        let newPublicId: string | undefined;

        try {
            const mapped = await this.uploadAndMap({
                productId,
                file: normalizedFile,
                createdBy: updatedBy,
                folder: MEDIA_STORAGE_FOLDERS.PRODUCTS,
                displayOrder: media.displayOrder,
                isPrimary: media.isPrimary,
            });

            newPublicId = mapped.publicId;

            const updated = await this.mediaRepository.updateById(mediaId, {
                publicId: mapped.publicId,
                url: mapped.url,
                secureUrl: mapped.secureUrl,
                storageProvider: mapped.storageProvider,
                mediaType: mapped.mediaType,
                mimeType: mapped.mimeType,
                fileName: mapped.fileName,
                originalName: mapped.originalName,
                extension: mapped.extension,
                size: mapped.size,
                width: mapped.width,
                height: mapped.height,
                metadata: mapped.metadata,
                updatedBy,
                // preserve displayOrder + isPrimary explicitly
                displayOrder: media.displayOrder,
                isPrimary: media.isPrimary,
            });

            if (!updated) {
                throw new Error("Media not found.");
            }

            if (oldPublicId && oldPublicId !== newPublicId) {
                try {
                    await this.storageProvider.delete(oldPublicId);
                } catch {
                    // Best-effort old asset cleanup after successful replace.
                }
            }

            return {
                id: String(updated._id),
                url: updated.secureUrl ?? updated.url,
                secureUrl: updated.secureUrl,
                isPrimary: updated.isPrimary,
                displayOrder: updated.displayOrder,
            };
        } catch (error: unknown) {
            if (newPublicId && newPublicId !== oldPublicId) {
                try {
                    await this.storageProvider.delete(newPublicId);
                } catch {
                    // best-effort rollback of the new upload
                }
            }
            throw error;
        }
    }

    /**
     * @deprecated Prefer deleteProductMedia(productId, mediaId).
     */
    async deleteMedia(_id: string): Promise<IMediaUploadResult> {
        throw new Error(
            "MediaService.deleteMedia requires productId. Use deleteProductMedia."
        );
    }

    /**
     * Validates Product + Media existence and ownership.
     */
    private async assertProductMediaOwnership(
        productId: string,
        mediaId: string
    ): Promise<{ media: IMediaDocument }> {
        this.assertValidProductId(productId);

        if (!Types.ObjectId.isValid(mediaId)) {
            throw new Error("Media not found.");
        }

        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new Error("Product not found.");
        }

        const media = await this.mediaRepository.findById(mediaId);
        if (!media) {
            throw new Error("Media not found.");
        }

        if (String(media.productId) !== String(productId)) {
            throw new Error(
                "Invalid request. Media does not belong to Product."
            );
        }

        return { media };
    }

    /**
     * Uploads via StorageProvider and maps the result to an ICreateMedia payload.
     * Assumes the file has already passed UploadValidator.
     */
    private async uploadAndMap(
        request: IMediaUploadRequest
    ): Promise<ICreateMedia> {
        const folder =
            request.folder ??
            request.storageOptions?.folder ??
            MEDIA_STORAGE_FOLDERS.PRODUCTS;

        const providerResult = await this.storageProvider.upload(
            {
                buffer: request.file.buffer,
                mimetype: request.file.mimetype,
                originalname: request.file.originalname,
                size: request.file.size,
            },
            {
                ...request.storageOptions,
                folder,
            }
        );

        const originalName = request.file.originalname?.trim();
        const extension = extractFileExtension(originalName);
        const secureUrl = providerResult.url;
        const storageProvider = this.resolveStorageProvider(
            this.storageProvider.name
        );

        return {
            productId: request.productId,
            publicId: providerResult.publicId,
            url: providerResult.url,
            secureUrl,
            storageProvider,
            mediaType: providerResult.resourceType ?? MEDIA_DEFAULTS.MEDIA_TYPE,
            mimeType: providerResult.mimeType ?? request.file.mimetype,
            fileName: providerResult.publicId ?? originalName,
            originalName,
            extension,
            size: providerResult.bytes ?? request.file.size,
            width: providerResult.width,
            height: providerResult.height,
            altText: request.altText,
            displayOrder:
                request.displayOrder ?? MEDIA_DEFAULTS.DISPLAY_ORDER,
            isPrimary: request.isPrimary ?? MEDIA_DEFAULTS.IS_PRIMARY,
            metadata: {
                format: providerResult.format,
                provider: storageProvider,
            },
            createdBy: request.createdBy,
        };
    }

    /**
     * Maps a persisted Media document to a standardized upload result DTO.
     */
    private toUploadResult(document: IMediaDocument): IMediaUploadResult {
        return {
            id: String(document._id),
            productId: String(document.productId),
            publicId: document.publicId,
            url: document.url,
            secureUrl: document.secureUrl,
            storageProvider: document.storageProvider,
            mediaType: document.mediaType,
            mimeType: document.mimeType,
            fileName: document.fileName,
            originalName: document.originalName,
            extension: document.extension,
            size: document.size,
            width: document.width,
            height: document.height,
            altText: document.altText,
            displayOrder: document.displayOrder,
            isPrimary: document.isPrimary,
            createdBy: document.createdBy
                ? String(document.createdBy)
                : undefined,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }

    /**
     * Best-effort rollback after Media docs were persisted but Product link failed.
     */
    private async rollbackPersistedMedia(
        mediaIds: string[],
        storagePublicIds: string[]
    ): Promise<void> {
        try {
            await this.mediaRepository.deleteManyByIds(mediaIds);
        } catch {
            // best-effort
        }

        await this.rollbackStorageOnly(storagePublicIds);
    }

    /**
     * Best-effort Cloudinary/storage cleanup for uploaded publicIds.
     */
    private async rollbackStorageOnly(
        storagePublicIds: string[]
    ): Promise<void> {
        for (const publicId of storagePublicIds) {
            try {
                await this.storageProvider.delete(publicId);
            } catch {
                // best-effort — do not mask the original error
            }
        }
    }

    /**
     * Unsets existing primary then sets the target — transaction when supported.
     */
    private async swapPrimaryMedia(
        productId: string,
        mediaId: string
    ): Promise<void> {
        try {
            const session = await mongoose.startSession();
            try {
                await session.withTransaction(async () => {
                    await this.mediaRepository.unsetPrimaryForProduct(
                        productId,
                        session
                    );
                    const updated = await this.mediaRepository.setPrimaryById(
                        mediaId,
                        session
                    );
                    if (!updated) {
                        throw new Error("Media not found.");
                    }
                });
            } finally {
                await session.endSession();
            }
        } catch (error: unknown) {
            if (!this.isTransactionUnsupported(error)) {
                throw error;
            }

            // Standalone MongoDB / no replica set — sequential fallback.
            await this.mediaRepository.unsetPrimaryForProduct(productId);
            const updated = await this.mediaRepository.setPrimaryById(mediaId);
            if (!updated) {
                throw new Error("Media not found.");
            }
        }
    }

    /**
     * Detects MongoDB errors when multi-document transactions are unavailable.
     */
    private isTransactionUnsupported(error: unknown): boolean {
        if (!error || typeof error !== "object") {
            return false;
        }

        const mongoError = error as {
            code?: number;
            codeName?: string;
            message?: string;
        };

        if (
            mongoError.code === 20 ||
            mongoError.code === 263 ||
            mongoError.codeName === "IllegalOperation" ||
            mongoError.codeName === "TransactionNumbersNotAllowed"
        ) {
            return true;
        }

        const message = (mongoError.message ?? "").toLowerCase();
        return (
            message.includes("transaction numbers are only allowed") ||
            message.includes("transactions are not supported") ||
            message.includes("replica set")
        );
    }

    private assertValidProductId(productId: Types.ObjectId | string): void {
        if (!productId || !Types.ObjectId.isValid(String(productId))) {
            throw new Error("A valid productId is required for media upload.");
        }
    }

    private resolveStorageProvider(name: string): MediaStorageProvider {
        const normalized = name.trim().toLowerCase();
        const values = Object.values(MediaStorageProvider) as string[];

        if (values.includes(normalized)) {
            return normalized as MediaStorageProvider;
        }

        return MEDIA_DEFAULTS.STORAGE_PROVIDER;
    }
}
