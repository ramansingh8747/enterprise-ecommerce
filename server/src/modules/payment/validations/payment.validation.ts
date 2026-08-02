/**
 * Payment validation placeholders (Step 15.6).
 *
 * No request schemas wired to routes yet.
 */

import { ValidationChain } from "express-validator";

/**
 * Placeholder validation chains for future Payment endpoints.
 */
export const paymentValidationPlaceholders = {
    create: [] as ValidationChain[],
    verify: [] as ValidationChain[],
    refund: [] as ValidationChain[],
    cancel: [] as ValidationChain[],
} as const;
