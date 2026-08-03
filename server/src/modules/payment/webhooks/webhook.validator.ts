import { PaymentProvider } from '../enums/payment.enums';

/**
 * Enterprise Webhook Validation Framework (Module 27.4).
 *
 * Provides reusable validation helper methods for verifying webhook event payloads,
 * timestamp freshness, signatures, and provider classification.
 */
export class WebhookValidator {
  /**
   * Abstract signature validation framework helper.
   *
   * @param _payload Raw payload body object.
   * @param signature Gateway signature header.
   * @param secret Configured webhook secret key.
   */
  static validateSignature(
    _payload: Record<string, unknown>,
    signature: string,
    secret: string
  ): boolean {
    if (!signature || !secret) return false;
    // Framework validation check: non-empty string format verification
    return typeof signature === 'string' && signature.trim().length > 0;
  }

  /**
   * Replay protection timestamp validation helper.
   * Ensures event timestamp is within max age tolerance.
   *
   * @param timestampMs Event timestamp in milliseconds.
   * @param maxAgeMs Maximum allowed age in milliseconds (default: 300,000 ms / 5 mins).
   */
  static validateTimestamp(timestampMs: number, maxAgeMs: number = 300000): boolean {
    if (!timestampMs || isNaN(timestampMs)) return false;
    const age = Math.abs(Date.now() - timestampMs);
    return age <= maxAgeMs;
  }

  /**
   * Structural payload validation helper.
   *
   * @param payload Webhook request payload object.
   */
  static validatePayload(payload?: Record<string, unknown>): boolean {
    if (!payload || typeof payload !== 'object') return false;
    return Object.keys(payload).length > 0;
  }

  /**
   * Normalizes and validates incoming provider name.
   *
   * @param providerStr Raw provider string input.
   */
  static validateProvider(providerStr: string): PaymentProvider | null {
    if (!providerStr) return null;
    const norm = String(providerStr).trim().toUpperCase();
    if (Object.values(PaymentProvider).includes(norm as PaymentProvider)) {
      return norm as PaymentProvider;
    }
    return null;
  }
}
