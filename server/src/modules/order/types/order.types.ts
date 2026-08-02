/**
 * Enterprise Order Module — shared enums / types.
 *
 * Shape-only contracts. Transition rules live in Order Service (Step 15.5).
 */

/**
 * Order fulfillment lifecycle status.
 */
export enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    PACKED = "PACKED",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURN_REQUESTED = "RETURN_REQUESTED",
    RETURNED = "RETURNED",
    REFUNDED = "REFUNDED",
}

/**
 * Payment lifecycle status (Payment module integrates later).
 */
export enum PaymentStatus {
    PENDING = "PENDING",
    AUTHORIZED = "AUTHORIZED",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

/**
 * High-level fulfillment status (placeholders).
 */
export enum FulfillmentStatus {
    UNFULFILLED = "UNFULFILLED",
    PARTIAL = "PARTIAL",
    FULFILLED = "FULFILLED",
}
