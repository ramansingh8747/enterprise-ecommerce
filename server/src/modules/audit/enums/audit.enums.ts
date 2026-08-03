/**
 * Enterprise Audit Logging Engine — Shared Enumerations (Module 24.1).
 *
 * Centralized domain enums representing audit actions, target entities,
 * log severities, and execution statuses across the enterprise platform.
 * Transport-independent and schema-agnostic.
 */

/**
 * Enumeration of all auditable system actions and operations.
 */
export enum AuditAction {
  CREATE          = 'CREATE',
  UPDATE          = 'UPDATE',
  DELETE          = 'DELETE',
  LOGIN           = 'LOGIN',
  LOGOUT          = 'LOGOUT',
  PASSWORD_RESET  = 'PASSWORD_RESET',
  VERIFY_OTP      = 'VERIFY_OTP',
  PLACE_ORDER     = 'PLACE_ORDER',
  CANCEL_ORDER    = 'CANCEL_ORDER',
  PAYMENT         = 'PAYMENT',
  REFUND          = 'REFUND',
  EXPORT          = 'EXPORT',
  IMPORT          = 'IMPORT',
  VIEW            = 'VIEW',
  DOWNLOAD        = 'DOWNLOAD',
  UPLOAD          = 'UPLOAD',
}

/**
 * Enumeration of all domain entities and system resources subject to audit.
 */
export enum AuditEntity {
  USER            = 'USER',
  PRODUCT         = 'PRODUCT',
  CATEGORY        = 'CATEGORY',
  BRAND           = 'BRAND',
  PRODUCT_VARIANT = 'PRODUCT_VARIANT',
  INVENTORY       = 'INVENTORY',
  ORDER           = 'ORDER',
  PAYMENT         = 'PAYMENT',
  REVIEW          = 'REVIEW',
  COUPON          = 'COUPON',
  FILE            = 'FILE',
  NOTIFICATION    = 'NOTIFICATION',
  ROLE            = 'ROLE',
  SESSION         = 'SESSION',
  AUTH            = 'AUTH',
}

/**
 * Enumeration of audit event severity levels for risk assessment and alert triggers.
 */
export enum AuditSeverity {
  LOW      = 'LOW',
  MEDIUM   = 'MEDIUM',
  HIGH     = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Enumeration of execution statuses for recorded audit events.
 */
export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  WARNING = 'WARNING',
}
