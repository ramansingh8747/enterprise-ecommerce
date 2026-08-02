/**
 * Storage provider contracts (Media Module Step 13.2).
 *
 * Port for pluggable backends: Cloudinary (current), AWS S3 / Local (future).
 * Controllers must not call storage SDKs directly — use MediaService → provider.
 */

import { MediaType } from "../types/media.types";

/**
 * Normalized file input accepted by storage providers.
 * Compatible with Multer memory-storage files (`file.buffer`).
 */
export interface IUploadFileInput {
    buffer: Buffer;
    mimetype: string;
    originalname?: string;
    size?: number;
}

/**
 * Optional upload options shared across providers.
 */
export interface IStorageUploadOptions {
    folder?: string;
    publicId?: string;
    resourceType?: "image" | "video" | "raw" | "auto";
    overwrite?: boolean;
    tags?: string[];
}

/**
 * Normalized upload result returned by any storage adapter.
 */
export interface IStorageUploadResult {
    url: string;
    publicId?: string;
    resourceType: MediaType;
    mimeType?: string;
    bytes?: number;
    width?: number;
    height?: number;
    format?: string;
}

/**
 * Enterprise media storage port (DIP).
 */
export interface IStorageProvider {
    readonly name: string;

    upload(
        file: IUploadFileInput,
        options?: IStorageUploadOptions
    ): Promise<IStorageUploadResult>;

    delete(publicId: string): Promise<void>;
}
