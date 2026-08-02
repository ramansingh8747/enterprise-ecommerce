/**
 * Notification validation placeholders (Step 15.9).
 *
 * No request schemas wired to routes yet.
 */

import { ValidationChain } from "express-validator";

/**
 * Placeholder validation chains for future Notification endpoints.
 */
export const notificationValidationPlaceholders = {
    send: [] as ValidationChain[],
} as const;
