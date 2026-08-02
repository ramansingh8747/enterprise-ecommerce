/**
 * Enterprise Email Module — Enums and Type Definitions (Module 20.1).
 * Transport-independent foundation.
 */

/**
 * Functional category classification for email routing and throttling.
 */
export enum EmailCategory {
  TRANSACTIONAL = 'TRANSACTIONAL',
  AUTH = 'AUTH',
  ORDER = 'ORDER',
  INVOICE = 'INVOICE',
  PROMOTIONAL = 'PROMOTIONAL',
  NEWSLETTER = 'NEWSLETTER',
  ADMIN_NOTIFICATION = 'ADMIN_NOTIFICATION',
  VENDOR_NOTIFICATION = 'VENDOR_NOTIFICATION',
  SYSTEM = 'SYSTEM',
}

/**
 * Delivery priority levels for queueing and vendor routing.
 */
export enum EmailPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Email lifecycle status states.
 */
export enum EmailStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  QUEUED = 'QUEUED',
}

/**
 * Standardized Email Template Identifiers.
 */
export enum EmailTemplateId {
  OTP = 'otp',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  ORDER_CONFIRMATION = 'order_confirmation',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  REFUND_ISSUED = 'refund_issued',
  INVOICE = 'invoice',
  COUPON_REWARD = 'coupon_reward',
  PROMOTIONAL = 'promotional',
  NEWSLETTER = 'newsletter',
  ADMIN_ALERT = 'admin_alert',
}
