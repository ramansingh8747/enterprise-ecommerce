/**
 * Reusable Cloudinary service (Media Module Step 13.2).
 *
 * Wraps the shared Cloudinary SDK instance for buffer upload / destroy.
 * No HTTP concerns — used by CloudinaryProvider only.
 */

import { UploadApiResponse } from "cloudinary";
import cloudinary from "../../../config/cloudinary";

export interface CloudinaryUploadOptions {
    folder?: string;
    public_id?: string;
    resource_type?: "image" | "video" | "raw" | "auto";
    overwrite?: boolean;
    tags?: string[];
}

/**
 * Thin Cloudinary SDK facade for the Media module.
 */
export class CloudinaryService {
    /**
     * Returns the singleton Cloudinary SDK instance (configured once via env).
     */
    getClient(): typeof cloudinary {
        return cloudinary;
    }

    /**
     * Uploads an in-memory buffer to Cloudinary via upload_stream.
     */
    uploadBuffer(
        buffer: Buffer,
        options: CloudinaryUploadOptions = {}
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: options.folder,
                    public_id: options.public_id,
                    resource_type: options.resource_type ?? "image",
                    overwrite: options.overwrite,
                    tags: options.tags,
                },
                (error, result) => {
                    if (error || !result) {
                        reject(
                            error ??
                                new Error(
                                    "Cloudinary upload failed without a result."
                                )
                        );
                        return;
                    }
                    resolve(result);
                }
            );

            stream.end(buffer);
        });
    }

    /**
     * Deletes an asset by Cloudinary public_id.
     */
    async destroy(
        publicId: string,
        resourceType: "image" | "video" | "raw" = "image"
    ): Promise<void> {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
    }
}

/**
 * Shared CloudinaryService instance for Media providers.
 */
export const cloudinaryService = new CloudinaryService();
