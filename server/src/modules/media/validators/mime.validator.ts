/**
 * MIME type validator for Media image uploads (Step 13.5).
 */

import {
    MEDIA_ALLOWED_MIME_TYPES,
    MEDIA_REJECTED_MIME_PREFIXES,
} from "../media.upload-limits";
import {
    failValidation,
    IMediaValidationResult,
    passValidation,
} from "../interfaces/media-validation-result.interface";

/**
 * Validates that a MIME type is an allowed image type.
 */
export const validateMimeType = (
    mimeType: string | undefined
): IMediaValidationResult => {
    const normalized = mimeType?.trim().toLowerCase();

    if (!normalized) {
        return failValidation("Invalid image format.", [
            {
                field: "mimetype",
                message: "MIME type is required.",
            },
        ]);
    }

    for (const prefix of MEDIA_REJECTED_MIME_PREFIXES) {
        if (normalized.startsWith(prefix)) {
            return failValidation("Invalid image format.", [
                {
                    field: "mimetype",
                    message: `MIME type "${normalized}" is not allowed for image uploads.`,
                    value: normalized,
                },
            ]);
        }
    }

    if (
        !(MEDIA_ALLOWED_MIME_TYPES as readonly string[]).includes(normalized)
    ) {
        return failValidation("Invalid image format.", [
            {
                field: "mimetype",
                message: `MIME type "${normalized}" is not supported. Allowed: jpeg, jpg, png, webp, avif.`,
                value: normalized,
            },
        ]);
    }

    return passValidation();
};
