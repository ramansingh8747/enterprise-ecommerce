import { RateLimitStrategy, ThrottleAction } from '../enums/rate-limit.enums';

/**
 * Enterprise API Rate Limiting & Throttling Module — Constants (Module 28.1).
 *
 * System defaults, maximum boundaries, key prefixes, and standard HTTP header names.
 */

/** Default evaluation window duration in milliseconds (60,000 ms = 1 minute). */
export const DEFAULT_WINDOW_MS = 60000;

/** Default maximum allowed requests per window. */
export const DEFAULT_MAX_REQUESTS = 100;

/** Default burst request allowance limit for token bucket strategy. */
export const DEFAULT_BURST_LIMIT = 20;

/** Default penalty block duration in milliseconds (900,000 ms = 15 minutes). */
export const DEFAULT_BLOCK_DURATION_MS = 900000;

/** Maximum length in characters for rate limit identifier keys. */
export const MAX_IDENTIFIER_LENGTH = 256;

/** Global prefix key for rate limit storage entries. */
export const RATE_LIMIT_PREFIX = 'ratelimit';

/** Default rate limit strategy. */
export const DEFAULT_RATE_LIMIT_STRATEGY = RateLimitStrategy.FIXED_WINDOW;

/** Default throttling action on quota excess. */
export const DEFAULT_THROTTLE_ACTION = ThrottleAction.REJECT;

/** Standard IETF RateLimit HTTP Response Headers. */
export const RATE_LIMIT_HEADER_LIMIT = 'X-RateLimit-Limit';
export const RATE_LIMIT_HEADER_REMAINING = 'X-RateLimit-Remaining';
export const RATE_LIMIT_HEADER_RESET = 'X-RateLimit-Reset';
export const RATE_LIMIT_HEADER_RETRY_AFTER = 'Retry-After';
