/**
 * Extension validator for Media image uploads (Step 13.5).
 */

import { MEDIA_ALLOWED_EXTENSIONS } from "../media.upload-limits";
import {
    failValidation,
    IMediaValidationResult,
    passValidation,
} from "../interfaces/media-validation-result.interface";

/**
 * Extracts a lowercase extension (without dot) from a filename.
 */
export const extractFileExtension = (
    filename: string | undefined
): string | undefined => {
    if (!filename?.includes(".")) {
        return undefined;
    }

    const extension = filename.split(".").pop()?.trim().toLowerCase();
    return extension || undefined;
};

/**
 * Validates that a file extension is allowed for image uploads.
 */
export const validateExtension = (
    filename: string | undefined
): IMediaValidationResult => {
    const extension = extractFileExtension(filename);

    if (!extension) {
        return failValidation("Invalid image format.", [
            {
                field: "extension",
                message: "File extension is required (.jpg, .jpeg, .png, .webp, .avif).",
                value: filename,
            },
        ]);
    }

    if (
        !(MEDIA_ALLOWED_EXTENSIONS as readonly string[]).includes(extension)
    ) {
        return failValidation("Invalid image format.", [
            {
                field: "extension",
                message: `Extension ".${extension}" is not allowed. Allowed: .jpg, .jpeg, .png, .webp, .avif.`,
                value: extension,
            },
        ]);
    }

    return passValidation();
};
