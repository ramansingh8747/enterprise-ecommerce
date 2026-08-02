/**
 * Image-focused validator composing MIME + extension checks (Step 13.5).
 *
 * Reusable for Product / Brand / Category / User image uploads.
 */

import { IMulterMemoryFile } from "../interfaces/upload-request.interface";
import {
    failValidation,
    IMediaValidationIssue,
    IMediaValidationResult,
    passValidation,
} from "../interfaces/media-validation-result.interface";
import { validateExtension } from "./extension.validator";
import { validateMimeType } from "./mime.validator";

/**
 * Validates that a Multer file is an allowed image (MIME + extension).
 */
export const validateImageFile = (
    file: IMulterMemoryFile | undefined
): IMediaValidationResult => {
    if (!file) {
        return failValidation("Invalid image format.", [
            {
                field: "file",
                message: "An image file is required.",
            },
        ]);
    }

    const details: IMediaValidationIssue[] = [];

    const mimeResult = validateMimeType(file.mimetype);
    if (!mimeResult.success && mimeResult.details) {
        details.push(...mimeResult.details);
    }

    const extensionResult = validateExtension(file.originalname);
    if (!extensionResult.success && extensionResult.details) {
        details.push(...extensionResult.details);
    }

    if (details.length > 0) {
        return failValidation("Invalid image format.", details);
    }

    return passValidation();
};
