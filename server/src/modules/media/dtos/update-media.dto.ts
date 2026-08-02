/**
 * Update Media DTO (shape-only — validation lands in later steps).
 */
export interface UpdateMediaDto {
    url?: string;
    secureUrl?: string;
    publicId?: string;
    mediaType?: string;
    storageProvider?: string;
    isPrimary?: boolean;
    displayOrder?: number;
    mimeType?: string;
    fileName?: string;
    originalName?: string;
    extension?: string;
    size?: number;
    width?: number;
    height?: number;
    altText?: string;
    metadata?: Record<string, unknown>;
}
