import { RateLimitScope } from '../enums/rate-limit.enums';
import {
  MAX_IDENTIFIER_LENGTH,
  RATE_LIMIT_HEADER_LIMIT,
  RATE_LIMIT_HEADER_REMAINING,
  RATE_LIMIT_HEADER_RESET,
  RATE_LIMIT_HEADER_RETRY_AFTER,
  RATE_LIMIT_PREFIX,
} from '../constants/rate-limit.constants';

/**
 * Enterprise Rate Limiting Utility Helpers (Module 28.1).
 *
 * Provides reusable key builders, identifier sanitizers, reset time math,
 * and standard IETF RateLimit HTTP response header formatters.
 */
export class RateLimitUtil {
  /**
   * Normalizes a raw client identifier string.
   *
   * @param rawIdentifier Client IP, userId, or API key string.
   */
  static normalizeIdentifier(rawIdentifier: string): string {
    if (!rawIdentifier) return 'unknown';
    const trimmed = String(rawIdentifier).trim().toLowerCase();
    return trimmed.slice(0, MAX_IDENTIFIER_LENGTH);
  }

  /**
   * Validates whether an identifier string is non-empty and within bounds.
   *
   * @param identifier Target identifier string.
   */
  static validateIdentifier(identifier?: string): boolean {
    if (!identifier || typeof identifier !== 'string') return false;
    const trimmed = identifier.trim();
    return trimmed.length > 0 && trimmed.length <= MAX_IDENTIFIER_LENGTH;
  }

  /**
   * Builds a formatted composite storage key for rate limit tracking.
   * Format: `ratelimit:<scope>:<identifier>` (e.g., `ratelimit:ip:127.0.0.1`).
   *
   * @param scope RateLimitScope enum.
   * @param identifier Client identifier string.
   * @param prefix Custom key prefix. Defaults to RATE_LIMIT_PREFIX.
   */
  static buildRateLimitKey(
    scope: RateLimitScope,
    identifier: string,
    prefix: string = RATE_LIMIT_PREFIX
  ): string {
    const cleanPrefix = prefix ? prefix.trim().toLowerCase() : RATE_LIMIT_PREFIX;
    const cleanScope = scope.toLowerCase();
    const cleanId = this.normalizeIdentifier(identifier);

    return `${cleanPrefix}:${cleanScope}:${cleanId}`;
  }

  /**
   * Calculates window expiration reset Unix timestamp in milliseconds.
   *
   * @param windowMs Window duration in milliseconds.
   * @param startTimeMs Window start timestamp in milliseconds. Defaults to Date.now().
   */
  static calculateResetTime(windowMs: number, startTimeMs: number = Date.now()): number {
    const validWindow = Math.max(1000, windowMs);
    return startTimeMs + validWindow;
  }

  /**
   * Formats standard HTTP rate limit response headers.
   *
   * @param limit Total max requests quota.
   * @param remaining Remaining allowed requests in window.
   * @param resetTimeMs Expiration Unix timestamp in milliseconds.
   * @param retryAfterSeconds Optional Retry-After delay in seconds.
   */
  static buildHeaders(
    limit: number,
    remaining: number,
    resetTimeMs: number,
    retryAfterSeconds?: number
  ): Record<string, string> {
    const resetEpochSeconds = Math.ceil(resetTimeMs / 1000);
    const headers: Record<string, string> = {
      [RATE_LIMIT_HEADER_LIMIT]: String(Math.max(0, limit)),
      [RATE_LIMIT_HEADER_REMAINING]: String(Math.max(0, remaining)),
      [RATE_LIMIT_HEADER_RESET]: String(resetEpochSeconds),
    };

    if (retryAfterSeconds !== undefined && retryAfterSeconds > 0) {
      headers[RATE_LIMIT_HEADER_RETRY_AFTER] = String(Math.ceil(retryAfterSeconds));
    }

    return headers;
  }
}
