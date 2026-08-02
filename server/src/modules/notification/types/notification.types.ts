/**
 * Enterprise Notification Module — shared enums and type definitions (Module 19.1).
 * Transport-independent foundation.
 */

/**
 * Supported delivery notification channels.
 */
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
  WEBHOOK = 'WEBHOOK',
  MOCK = 'MOCK',
}

/**
 * Domain notification event types.
 */
export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  WELCOME = 'WELCOME',
  PASSWORD_RESET = 'PASSWORD_RESET',
  OTP = 'OTP',
  COUPON_CREATED = 'COUPON_CREATED',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  WISHLIST_PRICE_DROP = 'WISHLIST_PRICE_DROP',
  GENERIC = 'GENERIC',
}

/**
 * Delivery priority levels for queueing and routing.
 */
export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Notification delivery lifecycle status.
 */
export enum NotificationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
  CANCELLED = 'CANCELLED',
  QUEUED = 'QUEUED',
}

/**
 * Named notification templates.
 */
export enum NotificationTemplate {
  ORDER_PLACED = 'order_placed',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  OTP = 'otp',
  GENERIC = 'generic',
}
