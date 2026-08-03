import { RateLimitScope } from '../enums/rate-limit.enums';

/**
 * Rate Limit Reset Request DTO (Module 28.5).
 *
 * Payload for resetting quota for a single identifier or batch of identifiers.
 */
export interface RateLimitResetDto {
  /** Single target identifier string (e.g. IP address or userId). */
  identifier?: string;

  /** Scope classification (defaults to IP). */
  scope?: RateLimitScope;

  /** Whether child sub-keys should also be reset. */
  resetChildren?: boolean;

  /** Optional array of identifiers for batch reset. */
  identifiers?: string[];
}
