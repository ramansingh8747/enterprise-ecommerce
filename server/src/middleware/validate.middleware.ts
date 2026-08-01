import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiResponse } from "../interfaces/api-response.interface";

/**
 * Express-validator result middleware.
 * Returns 400 with the first validation error message when chains fail.
 */
export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        next();
        return;
    }

    const firstError = errors.array({ onlyFirstError: true })[0];
    const message =
        firstError && "msg" in firstError
            ? String(firstError.msg)
            : "Validation failed.";

    const response: ApiResponse = {
        success: false,
        message,
        data: errors.array(),
    };

    res.status(400).json(response);
};
