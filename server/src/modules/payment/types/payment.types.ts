/**
 * Enterprise Payment Module — shared enums / types (Step 15.6).
 *
 * Shape-only contracts. No gateway or webhook logic.
 */

/**
 * Supported payment gateway identifiers (factory keys).
 */
export enum PaymentProviderType {
    MOCK = "mock",
    RAZORPAY = "razorpay",
    STRIPE = "stripe",
    CASHFREE = "cashfree",
}

/**
 * Customer-facing payment method categories.
 */
export enum PaymentMethod {
    CARD = "CARD",
    UPI = "UPI",
    NET_BANKING = "NET_BANKING",
    WALLET = "WALLET",
    COD = "COD",
    BANK_TRANSFER = "BANK_TRANSFER",
}

/**
 * Payment lifecycle status (Payment module domain).
 * Order.paymentStatus remains the order-facing mirror (Order module).
 */
export enum PaymentStatus {
    PENDING = "PENDING",
    AUTHORIZED = "AUTHORIZED",
    PAID = "PAID",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED",
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

/**
 * ISO-style currency codes used by Payment operations.
 */
export enum PaymentCurrency {
    INR = "INR",
    USD = "USD",
    EUR = "EUR",
}
