import { PaymentProvider } from '../enums/payment.enums';
import {
  DEFAULT_CURRENCY,
  DEFAULT_PAYMENT_PROVIDER,
  DEFAULT_PAYMENT_TIMEOUT,
  MAX_PAYMENT_METADATA_SIZE,
} from '../constants/payment.constants';

/**
 * Enterprise Payment Gateway Module Configuration (Module 27.1 / 27.6).
 *
 * Strongly-typed options governing provider selection, request timeout,
 * currency defaults, retry limits, sandbox flags, webhook configuration, and metadata limits.
 * Supports environment variable overrides with safe production fallbacks.
 */
export interface IPaymentConfig {
  /** Active payment provider classification (MOCK, STRIPE, RAZORPAY, PAYPAL, CASHFREE). */
  provider: PaymentProvider;

  /** Payment gateway call timeout in milliseconds. */
  timeoutMs: number;

  /** Default ISO 4217 currency code. */
  defaultCurrency: string;

  /** Maximum retry attempts for transient payment API errors. */
  retryCount: number;

  /** Webhook verification secret signature key. */
  webhookSecret: string;

  /** Master switch enabling or disabling incoming webhook event processing. */
  enableWebhooks: boolean;

  /** Maximum allowed size in bytes for custom payment metadata. */
  metadataLimitBytes: number;

  /** Whether sandbox / test mode is active. */
  sandboxMode: boolean;
}

/**
 * Default production-ready payment configuration with environment fallbacks.
 */
export const DEFAULT_PAYMENT_CONFIG: IPaymentConfig = {
  provider: (process.env.PAYMENT_PROVIDER as PaymentProvider) || DEFAULT_PAYMENT_PROVIDER,
  timeoutMs: process.env.PAYMENT_TIMEOUT
    ? parseInt(process.env.PAYMENT_TIMEOUT, 10)
    : DEFAULT_PAYMENT_TIMEOUT,
  defaultCurrency:
    process.env.PAYMENT_DEFAULT_CURRENCY || process.env.PAYMENT_CURRENCY || DEFAULT_CURRENCY,
  retryCount: process.env.PAYMENT_MAX_RETRY
    ? parseInt(process.env.PAYMENT_MAX_RETRY, 10)
    : process.env.PAYMENT_RETRY_COUNT
    ? parseInt(process.env.PAYMENT_RETRY_COUNT, 10)
    : 3,
  webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_default_placeholder_secret',
  enableWebhooks: process.env.PAYMENT_ENABLE_WEBHOOKS !== 'false',
  metadataLimitBytes: process.env.PAYMENT_METADATA_LIMIT
    ? parseInt(process.env.PAYMENT_METADATA_LIMIT, 10)
    : MAX_PAYMENT_METADATA_SIZE,
  sandboxMode: process.env.PAYMENT_SANDBOX_MODE !== 'false',
};
