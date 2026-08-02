/**
 * File size validator for Media image uploads (Step 13.5).
 */

import {
    MEDIA_MAX_IMAGE_SIZE_BYTES,
    MEDIA_UPLOAD_LIMITS,
} from "../media.upload-limits";
import {
    failValidation,
    IMediaValidationResult,
    passValidation,
} from "../interfaces/media-validation-result.interface";

/**
 * Validates that a file size is within the configured maximum.
 */
export const validateFileSize = (
    sizeBytes: number | undefined
): IMediaValidationResult => {
    if (sizeBytes === undefined || sizeBytes === null) {
        return failValidation("Invalid image file size.", [
            {
                field: "size",
                message: "File size is required.",
            },
        ]);
    }

    if (!Number.isFinite(sizeBytes) || sizeBytes < 0) {
        return failValidation("Invalid image file size.", [
            {
                field: "size",
                message: "File size must be a non-negative number.",
                value: sizeBytes,
            },
        ]);
    }

    if (sizeBytes === 0) {
        return failValidation("Invalid image file size.", [
            {
                field: "size",
                message: "Uploaded file is empty.",
                value: 0,
            },
        ]);
    }

    if (sizeBytes > MEDIA_MAX_IMAGE_SIZE_BYTES) {
        return failValidation(
            `Invalid image file size. Maximum allowed is ${MEDIA_UPLOAD_LIMITS.MAX_IMAGE_SIZE_MB} MB.`,
            [
                {
                    field: "size",
                    message: `File exceeds the maximum size of ${MEDIA_UPLOAD_LIMITS.MAX_IMAGE_SIZE_MB} MB.`,
                    value: sizeBytes,
                },
            ]
        );
    }

    return passValidation();
};
