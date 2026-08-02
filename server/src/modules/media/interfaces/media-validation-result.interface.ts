/**
 * Media validation result contracts (Step 13.5).
 */

import { MEDIA_VALIDATION_FAILED_CODE } from "../media.upload-limits";

/**
 * Single validation issue detail.
 */
export interface IMediaValidationIssue {
    field?: string;
    message: string;
    value?: string | number;
}

/**
 * Standardized Media validation result (internal / service layer).
 *
 * HTTP responses continue to use the enterprise ApiResponse envelope
 * ({ success, message }) via thrown MediaValidationError.
 */
export interface IMediaValidationResult {
    success: boolean;
    code?: typeof MEDIA_VALIDATION_FAILED_CODE | string;
    message?: string;
    details?: IMediaValidationIssue[];
}

/**
 * Domain error thrown when Media upload validation fails.
 * Message includes "Invalid" / "required" so the global handler maps to HTTP 400.
 */
export class MediaValidationError extends Error {
    readonly code: string;
    readonly details: IMediaValidationIssue[];

    constructor(
        message: string,
        details: IMediaValidationIssue[] = [],
        code: string = MEDIA_VALIDATION_FAILED_CODE
    ) {
        super(message);
        this.name = "MediaValidationError";
        this.code = code;
        this.details = details;
    }
}

/**
 * Builds a failed validation result.
 */
export const failValidation = (
    message: string,
    details: IMediaValidationIssue[] = []
): IMediaValidationResult => ({
    success: false,
    code: MEDIA_VALIDATION_FAILED_CODE,
    message,
    details,
});

/**
 * Builds a successful validation result.
 */
export const passValidation = (): IMediaValidationResult => ({
    success: true,
});
