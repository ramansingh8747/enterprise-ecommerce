/**
 * Abstract storage provider base (Media Module Step 13.2).
 *
 * Business services depend on this port — not on Cloudinary/S3/Local.
 * Future adapters: S3StorageProvider, LocalStorageProvider.
 */

import {
    IStorageProvider,
    IStorageUploadOptions,
    IStorageUploadResult,
    IUploadFileInput,
} from "../interfaces/storage-provider.interface";

/**
 * Base class for all media storage backends.
 */
export abstract class StorageProvider implements IStorageProvider {
    abstract readonly name: string;

    /**
     * Upload a binary asset and return a normalized result.
     */
    abstract upload(
        file: IUploadFileInput,
        options?: IStorageUploadOptions
    ): Promise<IStorageUploadResult>;

    /**
     * Delete an asset by provider-specific public id / object key.
     */
    abstract delete(publicId: string): Promise<void>;
}
