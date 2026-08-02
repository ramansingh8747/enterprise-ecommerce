/**
 * Media upload validation orchestrator (Step 13.5).
 *
 * Runs MIME, extension, size, and filename validators in sequence.
 * Independent of controllers — callable from MediaService or future modules.
 */

import { MEDIA_UPLOAD_LIMITS } from "../media.upload-limits";
import {
    failValidation,
    IMediaValidationIssue,
    IMediaValidationResult,
    MediaValidationError,
    passValidation,
} from "../interfaces/media-validation-result.interface";
import { IMulterMemoryFile } from "../interfaces/upload-request.interface";
import { validateFileSize } from "./file-size.validator";
import { validateFilename } from "./filename.validator";
import { validateImageFile } from "./image.validator";

/**
 * Options for multi-file count validation (future Product integration).
 */
export interface IUploadCountValidationOptions {
    /**
     * Maximum number of files allowed in this request.
     * Defaults to MAX_PRODUCT_IMAGES from environment.
     */
    maxFiles?: number;

    /**
     * Optional existing media count already stored for the owner.
     * Used later for Product image caps — ignored when omitted.
     */
    existingCount?: number;
}

/**
 * Resolves byte size from Multer file (prefers `size`, falls back to buffer length).
 */
const resolveFileSize = (file: IMulterMemoryFile): number | undefined => {
    if (typeof file.size === "number") {
        return file.size;
    }

    if (file.buffer && Buffer.isBuffer(file.buffer)) {
        return file.buffer.length;
    }

    return undefined;
};

/**
 * Validates a single Multer memory file for image upload.
 * Returns a standardized result without throwing.
 */
export const validateUploadFile = (
    file: IMulterMemoryFile | undefined
): IMediaValidationResult & { normalizedFilename?: string } => {
    if (!file) {
        return failValidation("Invalid image format.", [
            {
                field: "file",
                message: "An uploaded file is required.",
            },
        ]);
    }

    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
        return failValidation("Invalid image format.", [
            {
                field: "file",
                message:
                    "Upload requires a Multer memory-storage file with a buffer.",
            },
        ]);
    }

    const details: IMediaValidationIssue[] = [];
    let normalizedFilename: string | undefined;

    const filenameResult = validateFilename(file.originalname);
    if (!filenameResult.success && filenameResult.details) {
        details.push(...filenameResult.details);
    } else {
        normalizedFilename = filenameResult.normalizedFilename;
    }

    const imageResult = validateImageFile({
        ...file,
        originalname: normalizedFilename ?? file.originalname,
    });
    if (!imageResult.success && imageResult.details) {
        details.push(...imageResult.details);
    }

    const sizeResult = validateFileSize(resolveFileSize(file));
    if (!sizeResult.success && sizeResult.details) {
        details.push(...sizeResult.details);
    }

    if (details.length > 0) {
        return {
            ...failValidation(
                details[0]?.message?.startsWith("Invalid")
                    ? details[0].message
                    : "Invalid image format.",
                details
            ),
            normalizedFilename,
        };
    }

    return {
        ...passValidation(),
        normalizedFilename,
    };
};

/**
 * Validates image count for future multi-upload flows (no Product logic).
 */
export const validateUploadCount = (
    fileCount: number,
    options: IUploadCountValidationOptions = {}
): IMediaValidationResult => {
    const maxFiles =
        options.maxFiles ?? MEDIA_UPLOAD_LIMITS.MAX_PRODUCT_IMAGES;
    const existingCount = options.existingCount ?? 0;

    if (!Number.isFinite(fileCount) || fileCount <= 0) {
        return failValidation("Invalid image upload count.", [
            {
                field: "files",
                message: "At least one image file is required.",
                value: fileCount,
            },
        ]);
    }

    if (fileCount > maxFiles) {
        return failValidation("Invalid image upload count.", [
            {
                field: "files",
                message: `Cannot upload more than ${maxFiles} images at once.`,
                value: fileCount,
            },
        ]);
    }

    if (existingCount + fileCount > maxFiles) {
        return failValidation("Invalid image upload count.", [
            {
                field: "files",
                message: `Image limit exceeded. Maximum allowed is ${maxFiles}.`,
                value: existingCount + fileCount,
            },
        ]);
    }

    return passValidation();
};

/**
 * Validates multiple Multer memory files.
 */
export const validateUploadFiles = (
    files: IMulterMemoryFile[] | undefined,
    options: IUploadCountValidationOptions = {}
): IMediaValidationResult => {
    if (!Array.isArray(files) || files.length === 0) {
        return failValidation("Invalid image upload count.", [
            {
                field: "files",
                message: "At least one image file is required.",
            },
        ]);
    }

    const countResult = validateUploadCount(files.length, options);
    if (!countResult.success) {
        return countResult;
    }

    const details: IMediaValidationIssue[] = [];

    files.forEach((file, index) => {
        const result = validateUploadFile(file);
        if (!result.success && result.details) {
            details.push(
                ...result.details.map((issue) => ({
                    ...issue,
                    field: issue.field
                        ? `files[${index}].${issue.field}`
                        : `files[${index}]`,
                }))
            );
        }
    });

    if (details.length > 0) {
        return failValidation("Invalid image format.", details);
    }

    return passValidation();
};

/**
 * Assert helpers — throw MediaValidationError on failure (service-layer use).
 */
export const assertValidUploadFile = (
    file: IMulterMemoryFile | undefined
): { normalizedFilename?: string } => {
    const result = validateUploadFile(file);

    if (!result.success) {
        throw new MediaValidationError(
            result.message ?? "Invalid image format.",
            result.details ?? []
        );
    }

    return { normalizedFilename: result.normalizedFilename };
};

export const assertValidUploadFiles = (
    files: IMulterMemoryFile[] | undefined,
    options: IUploadCountValidationOptions = {}
): void => {
    const result = validateUploadFiles(files, options);

    if (!result.success) {
        throw new MediaValidationError(
            result.message ?? "Invalid image format.",
            result.details ?? []
        );
    }
};

/**
 * UploadValidator facade for dependency injection / reuse across modules.
 */
export class UploadValidator {
    validateFile(file: IMulterMemoryFile | undefined): IMediaValidationResult {
        return validateUploadFile(file);
    }

    validateFiles(
        files: IMulterMemoryFile[] | undefined,
        options?: IUploadCountValidationOptions
    ): IMediaValidationResult {
        return validateUploadFiles(files, options);
    }

    validateCount(
        fileCount: number,
        options?: IUploadCountValidationOptions
    ): IMediaValidationResult {
        return validateUploadCount(fileCount, options);
    }

    assertFile(file: IMulterMemoryFile | undefined): {
        normalizedFilename?: string;
    } {
        return assertValidUploadFile(file);
    }

    assertFiles(
        files: IMulterMemoryFile[] | undefined,
        options?: IUploadCountValidationOptions
    ): void {
        assertValidUploadFiles(files, options);
    }
}

export const uploadValidator = new UploadValidator();
