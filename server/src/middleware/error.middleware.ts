import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../interfaces/api-response.interface";

/**
 * Maps known domain Error messages to HTTP status codes.
 * Falls back to 500 for unexpected failures.
 */
const resolveStatusCode = (message: string): number => {
    const normalized = message.toLowerCase();

    if (
        normalized.includes("not found") ||
        normalized.includes("does not exist") ||
        normalized.includes("not present")
    ) {
        return 404;
    }

    if (
        normalized.includes("already exists") ||
        normalized.includes("unable to generate a unique") ||
        normalized.includes("duplicate")
    ) {
        return 409;
    }

    if (
        normalized.includes("cannot be negative") ||
        normalized.includes("cannot be greater") ||
        normalized.includes("must be greater") ||
        normalized.includes("must be") ||
        normalized.includes("required") ||
        normalized.includes("insufficient stock") ||
        normalized.includes("out of stock") ||
        normalized.includes("quantity must") ||
        normalized.includes("capacity") ||
        normalized.includes("limit") ||
        normalized.includes("invalid")
    ) {
        return 400;
    }

    if (
        normalized.includes("unauthorized") ||
        normalized.includes("authentication")
    ) {
        return 401;
    }

    if (
        normalized.includes("access denied") ||
        normalized.includes("forbidden")
    ) {
        return 403;
    }

    return 500;
};

/**
 * Global Express error handler.
 * Converts thrown Errors into the standard ApiResponse envelope.
 */
export const errorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (res.headersSent) {
        return;
    }

    // Mongo duplicate key
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === 11000
    ) {
        const response: ApiResponse = {
            success: false,
            message: "Duplicate key conflict.",
        };

        res.status(409).json(response);
        return;
    }

    // Mongoose validation errors
    if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error as { name?: string }).name === "ValidationError"
    ) {
        const mongooseError = error as {
            message?: string;
            errors?: Record<string, { message?: string }>;
        };

        const firstFieldError = mongooseError.errors
            ? Object.values(mongooseError.errors)[0]?.message
            : undefined;

        const response: ApiResponse = {
            success: false,
            message:
                firstFieldError ||
                mongooseError.message ||
                "Validation failed.",
        };

        res.status(400).json(response);
        return;
    }

    if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error as { name?: string }).name === "CastError"
    ) {
        const response: ApiResponse = {
            success: false,
            message: "Invalid identifier.",
        };

        res.status(400).json(response);
        return;
    }

    const message =
        error instanceof Error ? error.message : "Internal Server Error";

    const statusCode = resolveStatusCode(message);

    if (statusCode === 500) {
        console.error("Unhandled Error:", error);
    }

    const response: ApiResponse = {
        success: false,
        message:
            statusCode === 500 ? "Internal Server Error" : message,
    };

    res.status(statusCode).json(response);
};
