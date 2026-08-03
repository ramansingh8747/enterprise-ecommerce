import { PaymentProvider } from '../enums/payment.enums';

/**
 * Enterprise Payment Gateway Module — Production Constants (Module 27.1).
 *
 * Single source of truth for payment timeout thresholds, currency defaults,
 * refund amount upper bounds, and ID prefixes.
 */

/** Default payment gateway execution timeout in milliseconds (30 seconds). */
export const DEFAULT_PAYMENT_TIMEOUT = 30000 as const;

/** Default transaction currency ISO code. */
export const DEFAULT_CURRENCY = 'USD' as const;

/** Upper bound limit for a single refund transaction amount. */
export const MAX_REFUND_AMOUNT = 1000000 as const;

/** Maximum allowed payload size for custom payment metadata in bytes (10 KB). */
export const MAX_PAYMENT_METADATA_SIZE = 10240 as const;

/** Default payment provider fallback when unconfigured. */
export const DEFAULT_PAYMENT_PROVIDER = PaymentProvider.MOCK;

/** Standardized prefix prepended to system payment transaction IDs. */
export const PAYMENT_ID_PREFIX = 'pay_' as const;

/** Standardized prefix prepended to system refund transaction IDs. */
export const REFUND_ID_PREFIX = 'rfnd_' as const;

/** Base path for Payment REST API endpoints. */
export const PAYMENT_BASE_PATH = '/api/v1/payments' as const;

/** Pre-existing compatibility object for legacy imports. */
export const PAYMENT_DEFAULTS = {
  CURRENCY: DEFAULT_CURRENCY,
  TIMEOUT: DEFAULT_PAYMENT_TIMEOUT,
  PROVIDER: DEFAULT_PAYMENT_PROVIDER,
} as const;
