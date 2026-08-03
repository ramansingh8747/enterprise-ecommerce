import { RateLimitScope } from '../enums/rate-limit.enums';

/**
 * Rate Limit Whitelist Request DTO (Module 28.5).
 *
 * Payload for adding an identifier to the active rate limit whitelist.
 */
export interface RateLimitWhitelistDto {
  /** Target client identifier (IP address, userId, or API key). */
  identifier: string;

  /** Scope classification. */
  scope?: RateLimitScope;

  /** Reason for whitelisting. */
  reason?: string;

  /** Optional expiration timestamp. */
  expiresAt?: string | Date;

  /** Custom metadata object. */
  metadata?: Record<string, unknown>;
}
