import { randomBytes } from 'crypto';
import {
  DEFAULT_CURRENCY,
  MAX_PAYMENT_METADATA_SIZE,
  MAX_REFUND_AMOUNT,
  PAYMENT_ID_PREFIX,
} from '../constants/payment.constants';

/**
 * Enterprise Payment Gateway Utility (Module 27.1).
 *
 * Pure utility class providing helpers for payment ID generation, currency normalization,
 * amount validation, and metadata sanitization.
 */
export class PaymentUtil {
  /**
   * Generates a unique system payment transaction ID.
   *
   * Format: pay_<timestamp_hex>_<random_hex> (e.g., 'pay_18c5e2a9_4f8b2c1d')
   *
   * @param prefix Custom ID prefix (defaults to 'pay_').
   */
  static generatePaymentId(prefix: string = PAYMENT_ID_PREFIX): string {
    const timestampHex = Date.now().toString(16);
    const randomHex = randomBytes(4).toString('hex');
    return `${prefix}${timestampHex}_${randomHex}`;
  }

  /**
   * Normalizes ISO 4217 currency code to uppercase string.
   *
   * @param currency Target currency code input.
   */
  static normalizeCurrency(currency?: string): string {
    if (!currency || typeof currency !== 'string') return DEFAULT_CURRENCY;
    const trimmed = currency.trim().toUpperCase();
    return trimmed.length === 3 ? trimmed : DEFAULT_CURRENCY;
  }

  /**
   * Validates monetary transaction amount values.
   * Amount must be a positive number greater than 0 and less than MAX_REFUND_AMOUNT.
   *
   * @param amount Transaction monetary amount.
   */
  static validateAmount(amount: number): boolean {
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) return false;
    return amount > 0 && amount <= MAX_REFUND_AMOUNT;
  }

  /**
   * Normalizes custom metadata dictionaries into safe JSON objects.
   *
   * @param metadata Input metadata object.
   */
  static buildMetadata(metadata?: Record<string, unknown>): Record<string, unknown> {
    if (!metadata || typeof metadata !== 'object') return {};
    return PaymentUtil.sanitizeMetadata(metadata);
  }

  /**
   * Sanitizes metadata objects by stripping recursive functions and enforcing size budget.
   *
   * @param metadata Target metadata dictionary.
   */
  static sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> {
    if (!metadata) return {};

    try {
      const sanitized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(metadata)) {
        if (typeof value === 'function' || typeof value === 'symbol') continue;
        if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) continue;
        sanitized[key] = value;
      }

      const jsonString = JSON.stringify(sanitized);
      if (jsonString.length > MAX_PAYMENT_METADATA_SIZE) {
        return { truncated: true, note: 'Metadata exceeded MAX_PAYMENT_METADATA_SIZE budget' };
      }

      return sanitized;
    } catch {
      return {};
    }
  }
}
