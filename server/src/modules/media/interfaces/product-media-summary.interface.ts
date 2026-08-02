/**
 * Selective Media summary attached to Product responses (Step 13.6).
 *
 * Does not expose storage internals (publicId, metadata, audit fields).
 */

import { MediaType } from "../types/media.types";

/**
 * Product-facing Media reference DTO.
 */
export interface IProductMediaSummary {
    id: string;
    url: string;
    secureUrl?: string;
    isPrimary: boolean;
    displayOrder: number;
    mediaType?: MediaType;
}

/**
 * Lean Media fields required to build IProductMediaSummary.
 */
export interface IMediaSummarySource {
    _id: { toString(): string } | string;
    url: string;
    secureUrl?: string;
    isPrimary: boolean;
    displayOrder: number;
    mediaType?: MediaType;
}

/**
 * Maps a Media document/lean object to a Product response summary.
 */
export const toProductMediaSummary = (
    media: IMediaSummarySource
): IProductMediaSummary => ({
    id: String(media._id),
    url: media.url,
    secureUrl: media.secureUrl,
    isPrimary: media.isPrimary,
    displayOrder: media.displayOrder,
    mediaType: media.mediaType,
});
