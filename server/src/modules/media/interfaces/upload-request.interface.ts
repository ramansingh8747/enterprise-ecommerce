/**
 * Media upload request contracts (Step 13.4).
 *
 * Service-layer inputs — Multer memory files + product context.
 * No HTTP / validation middleware concerns.
 */

import { Types } from "mongoose";
import { IStorageUploadOptions } from "./storage-provider.interface";

/**
 * Multer memory-storage file shape accepted by MediaService.
 */
export interface IMulterMemoryFile {
    buffer: Buffer;
    mimetype: string;
    originalname?: string;
    size?: number;
    fieldname?: string;
    encoding?: string;
}

/**
 * Single-file upload request.
 */
export interface IMediaUploadRequest {
    productId: Types.ObjectId | string;
    file: IMulterMemoryFile;
    createdBy?: Types.ObjectId | string;
    altText?: string;
    displayOrder?: number;
    isPrimary?: boolean;
    folder?: string;
    storageOptions?: IStorageUploadOptions;
}

/**
 * Multi-file upload request (structural support; no special business rules yet).
 */
export interface IMediaUploadManyRequest {
    productId: Types.ObjectId | string;
    files: IMulterMemoryFile[];
    createdBy?: Types.ObjectId | string;
    folder?: string;
    storageOptions?: IStorageUploadOptions;
}
