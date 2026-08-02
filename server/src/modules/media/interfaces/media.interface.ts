/**
 * Enterprise Media Module — domain / persistence contracts (Step 13.3).
 */

import { Types } from "mongoose";
import { MediaStorageProvider, MediaType } from "../types/media.types";

/**
 * Flexible metadata bag for provider-specific / CDN fields.
 */
export interface IMediaMetadata {
    [key: string]: string | number | boolean | null | undefined | object;
}

/**
 * Core Media entity contract (storage-agnostic).
 * Independent of Product business logic — linked only by `productId`.
 */
export interface IMedia {
    productId: Types.ObjectId | string;
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
    metadata?: IMediaMetadata;
    createdBy?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Payload contract for creating a Media record (future service steps).
 */
export interface ICreateMedia {
    productId: Types.ObjectId | string;
    publicId?: string;
    url: string;
    secureUrl?: string;
    storageProvider?: MediaStorageProvider;
    mediaType?: MediaType;
    mimeType?: string;
    fileName?: string;
    originalName?: string;
    extension?: string;
    size?: number;
    width?: number;
    height?: number;
    altText?: string;
    displayOrder?: number;
    isPrimary?: boolean;
    metadata?: IMediaMetadata;
    createdBy?: Types.ObjectId | string;
}

/**
 * Payload contract for updating a Media record (future service steps).
 */
export interface IUpdateMedia {
    publicId?: string;
    url?: string;
    secureUrl?: string;
    storageProvider?: MediaStorageProvider;
    mediaType?: MediaType;
    mimeType?: string;
    fileName?: string;
    originalName?: string;
    extension?: string;
    size?: number;
    width?: number;
    height?: number;
    altText?: string;
    displayOrder?: number;
    isPrimary?: boolean;
    metadata?: IMediaMetadata;
    updatedBy?: Types.ObjectId | string;
}
