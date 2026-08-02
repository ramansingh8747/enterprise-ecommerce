/**
 * Filename validator for Media uploads (Step 13.5).
 */

import { MEDIA_UPLOAD_LIMITS } from "../media.upload-limits";
import {
    failValidation,
    IMediaValidationResult,
    passValidation,
} from "../interfaces/media-validation-result.interface";

/**
 * Characters that are not allowed in uploaded filenames.
 */
const INVALID_FILENAME_PATTERN = /[<>:"/\\|?*\x00-\x1F]/;

/**
 * Normalizes a filename to its basename (strips directories / traversal).
 */
export const normalizeFilename = (
    filename: string | undefined
): string | undefined => {
    if (filename === undefined || filename === null) {
        return undefined;
    }

    const trimmed = filename.trim();
    if (!trimmed) {
        return undefined;
    }

    const segments = trimmed.replace(/\\/g, "/").split("/");
    const base = segments[segments.length - 1]?.trim();
    return base || undefined;
};

/**
 * Validates and optionally normalizes an upload filename.
 */
export const validateFilename = (
    filename: string | undefined
): IMediaValidationResult & { normalizedFilename?: string } => {
    const normalized = normalizeFilename(filename);

    if (!normalized) {
        return {
            ...failValidation("Invalid image filename.", [
                {
                    field: "originalname",
                    message: "Filename is required and cannot be empty.",
                },
            ]),
        };
    }

    if (normalized === "." || normalized === "..") {
        return {
            ...failValidation("Invalid image filename.", [
                {
                    field: "originalname",
                    message: "Filename is invalid.",
                    value: normalized,
                },
            ]),
        };
    }

    if (INVALID_FILENAME_PATTERN.test(normalized)) {
        return {
            ...failValidation("Invalid image filename.", [
                {
                    field: "originalname",
                    message:
                        "Filename contains invalid characters. Avoid <>:\"/\\|?* and control characters.",
                    value: normalized,
                },
            ]),
        };
    }

    if (normalized.length > MEDIA_UPLOAD_LIMITS.MAX_FILENAME_LENGTH) {
        return {
            ...failValidation("Invalid image filename.", [
                {
                    field: "originalname",
                    message: `Filename cannot exceed ${MEDIA_UPLOAD_LIMITS.MAX_FILENAME_LENGTH} characters.`,
                    value: normalized.length,
                },
            ]),
        };
    }

    return {
        ...passValidation(),
        normalizedFilename: normalized,
    };
};
