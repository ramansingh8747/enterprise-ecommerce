/**
 * Enterprise Payment Module constants (Step 15.6).
 *
 * Shared labels and defaults only — no business logic.
 */

import {
    PaymentCurrency,
    PaymentMethod,
    PaymentProviderType,
    PaymentStatus,
} from "../types/payment.types";

/**
 * Defaults for Payment operations (future steps).
 */
export const PAYMENT_DEFAULTS = {
    PROVIDER: PaymentProviderType.MOCK,
    STATUS: PaymentStatus.PENDING,
    CURRENCY: PaymentCurrency.INR,
    METHOD: PaymentMethod.CARD,
} as const;

/**
 * Registered payment provider keys (factory lookup).
 */
export const PAYMENT_PROVIDERS = Object.values(PaymentProviderType);

/**
 * Supported payment methods.
 */
export const PAYMENT_METHODS = Object.values(PaymentMethod);

/**
 * Payment status labels.
 */
export const PAYMENT_STATUSES = Object.values(PaymentStatus);

/**
 * Supported currencies.
 */
export const PAYMENT_CURRENCIES = Object.values(PaymentCurrency);

/**
 * Placeholder collection names (persistence in a later step).
 */
export const PAYMENT_COLLECTIONS = {
    PAYMENTS: "payments",
    PAYMENT_TRANSACTIONS: "payment_transactions",
} as const;
