/**
 * Standardized Media upload result (Step 13.4).
 *
 * Returned by MediaService after provider upload + persistence.
 */

import { MediaStorageProvider, MediaType } from "../types/media.types";

/**
 * API-/service-friendly upload result (plain object, not a Mongoose document).
 */
export interface IMediaUploadResult {
    id: string;
    productId: string;
    publicId?: string;
    url: string;
    secureUrl?: string;
    storageProvider: MediaStorageProvider;
    mediaType: MediaType;
    mimeType?: string;
    fileName?: string;
    originalName?: string;
    extension?: string;
    size?: number;
    width?: number;
    height?: number;
    altText?: string;
    displayOrder: number;
    isPrimary: boolean;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Compact uploaded-item shape for Product media upload responses (Step 13.7).
 */
export interface IProductMediaUploadedItem {
    id: string;
    url: string;
    secureUrl?: string;
    isPrimary: boolean;
    displayOrder: number;
}

/**
 * Product multi-image upload response payload.
 */
export interface IProductMediaUploadResponse {
    productId: string;
    uploaded: IProductMediaUploadedItem[];
}

/**
 * Primary image update response payload (Step 13.8).
 */
export interface IProductPrimaryMediaResponse {
    productId: string;
    mediaId: string;
    isPrimary: true;
}

/**
 * Compact Media item returned after replace (Step 13.9).
 */
export interface IProductMediaReplaceResult {
    id: string;
    url: string;
    secureUrl?: string;
    isPrimary: boolean;
    displayOrder: number;
}
