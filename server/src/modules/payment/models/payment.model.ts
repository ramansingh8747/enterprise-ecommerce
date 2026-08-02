/**
 * Payment Mongoose model placeholder (Step 15.6).
 *
 * Schema / persistence land in a later Payment step.
 * This file reserves the model boundary only.
 */

import { IPayment } from "../interfaces/payment.interface";

/**
 * Future Payment document type alias (no schema registered yet).
 */
export type IPaymentDocument = IPayment & {
    _id?: string;
};

/**
 * Placeholder export — real Model registration deferred.
 */
export const PaymentModelPlaceholder = {
    collection: "payments",
    note: "Payment schema not registered in Step 15.6.",
} as const;
