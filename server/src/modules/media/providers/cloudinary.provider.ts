/**
 * Cloudinary storage provider (Media Module Step 13.2).
 *
 * Implements StorageProvider using CloudinaryService.
 * Controllers must not import this class for upload — MediaService will own orchestration later.
 */

import {
    IStorageUploadOptions,
    IStorageUploadResult,
    IUploadFileInput,
} from "../interfaces/storage-provider.interface";
import {
    CloudinaryService,
    cloudinaryService,
} from "../services/cloudinary.service";
import { MediaStorageProvider, MediaType } from "../types/media.types";
import { StorageProvider } from "./storage.provider";

/**
 * Maps Cloudinary resource_type strings to MediaType.
 */
const mapMediaType = (resourceType?: string): MediaType => {
    switch (resourceType) {
        case "video":
            return MediaType.VIDEO;
        case "raw":
            return MediaType.DOCUMENT;
        case "image":
        default:
            return MediaType.IMAGE;
    }
};

export class CloudinaryProvider extends StorageProvider {
    readonly name = MediaStorageProvider.CLOUDINARY;

    constructor(
        private readonly cloudinary: CloudinaryService = cloudinaryService
    ) {
        super();
    }

    /**
     * Uploads a Multer memory file (buffer) to Cloudinary.
     */
    async upload(
        file: IUploadFileInput,
        options: IStorageUploadOptions = {}
    ): Promise<IStorageUploadResult> {
        if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
            throw new Error(
                "CloudinaryProvider.upload requires an in-memory file buffer."
            );
        }

        const result = await this.cloudinary.uploadBuffer(file.buffer, {
            folder: options.folder,
            public_id: options.publicId,
            resource_type: options.resourceType ?? "image",
            overwrite: options.overwrite,
            tags: options.tags,
        });

        return {
            url: result.secure_url ?? result.url,
            publicId: result.public_id,
            resourceType: mapMediaType(result.resource_type),
            mimeType: file.mimetype,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            format: result.format,
        };
    }

    /**
     * Deletes a Cloudinary asset by public_id.
     */
    async delete(publicId: string): Promise<void> {
        if (!publicId?.trim()) {
            throw new Error(
                "CloudinaryProvider.delete requires a non-empty publicId."
            );
        }

        await this.cloudinary.destroy(publicId.trim(), "image");
    }
}

/**
 * Default Cloudinary provider instance for future MediaService wiring.
 */
export const cloudinaryProvider = new CloudinaryProvider();
