/**
 * Enterprise Payment Gateway Module — Shared Enumerations (Module 27.1).
 *
 * Centralized domain enums representing payment providers, payment methods,
 * transaction statuses, and payment transaction types across the platform.
 */

/**
 * Supported payment gateway integration providers.
 */
export enum PaymentProvider {
  MOCK     = 'MOCK',
  STRIPE   = 'STRIPE',
  RAZORPAY = 'RAZORPAY',
  PAYPAL   = 'PAYPAL',
  CASHFREE = 'CASHFREE',
}

/**
 * Supported customer payment methods.
 */
export enum PaymentMethod {
  CARD        = 'CARD',
  UPI         = 'UPI',
  NET_BANKING = 'NET_BANKING',
  WALLET      = 'WALLET',
  EMI         = 'EMI',
  COD         = 'COD',
}

/**
 * Lifecycle execution statuses for payment transactions.
 */
export enum PaymentStatus {
  CREATED            = 'CREATED',
  PENDING            = 'PENDING',
  PROCESSING         = 'PROCESSING',
  AUTHORIZED         = 'AUTHORIZED',
  CAPTURED           = 'CAPTURED',
  SUCCESS            = 'SUCCESS',
  FAILED             = 'FAILED',
  CANCELLED          = 'CANCELLED',
  REFUNDED           = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  EXPIRED            = 'EXPIRED',
}

/**
 * Payment transaction operation types.
 */
export enum PaymentType {
  PURCHASE       = 'PURCHASE',
  REFUND         = 'REFUND',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
  SUBSCRIPTION   = 'SUBSCRIPTION',
  PRE_AUTH       = 'PRE_AUTH',
}
