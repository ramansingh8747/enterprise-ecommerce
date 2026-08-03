import { RateLimitScope } from '../enums/rate-limit.enums';

/**
 * Rate Limit Blacklist Request DTO (Module 28.5).
 *
 * Payload for adding an identifier to the penalty blacklist.
 */
export interface RateLimitBlacklistDto {
  /** Target client identifier (IP address, userId, or API key). */
  identifier: string;

  /** Scope classification. */
  scope?: RateLimitScope;

  /** Reason for blacklisting. */
  reason?: string;

  /** Block penalty duration in milliseconds. */
  duration?: number;

  /** Optional expiration timestamp. */
  expiresAt?: string | Date;

  /** Custom metadata object. */
  metadata?: Record<string, unknown>;
}
