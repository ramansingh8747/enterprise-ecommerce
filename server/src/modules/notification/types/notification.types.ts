/**
 * Enterprise Notification Module — shared enums / types (Step 15.9).
 *
 * Shape-only contracts. No delivery logic.
 */

/**
 * Delivery channel / provider factory keys.
 */
export enum NotificationChannel {
    MOCK = "mock",
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
}

/**
 * Domain notification event types (Order hooks land later).
 */
export enum NotificationType {
    ORDER_PLACED = "ORDER_PLACED",
    ORDER_CONFIRMED = "ORDER_CONFIRMED",
    ORDER_SHIPPED = "ORDER_SHIPPED",
    ORDER_DELIVERED = "ORDER_DELIVERED",
    ORDER_CANCELLED = "ORDER_CANCELLED",
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
    PAYMENT_FAILED = "PAYMENT_FAILED",
    GENERIC = "GENERIC",
}

/**
 * Delivery lifecycle status (persistence in a later step).
 */
export enum NotificationStatus {
    PENDING = "PENDING",
    QUEUED = "QUEUED",
    SENT = "SENT",
    FAILED = "FAILED",
    RETRYING = "RETRYING",
}

/**
 * Named templates (content rendering deferred).
 */
export enum NotificationTemplate {
    ORDER_PLACED = "order_placed",
    ORDER_CONFIRMED = "order_confirmed",
    ORDER_SHIPPED = "order_shipped",
    ORDER_DELIVERED = "order_delivered",
    ORDER_CANCELLED = "order_cancelled",
    PAYMENT_SUCCESS = "payment_success",
    PAYMENT_FAILED = "payment_failed",
    GENERIC = "generic",
}
