/**
 * Enterprise Caching Engine — Production Constants (Module 26.1).
 *
 * Single source of truth for time-to-live (TTL) limits, namespace prefixes,
 * payload budgets, and key length constraints.
 */

/** Default time-to-live in seconds (300 seconds / 5 minutes). */
export const DEFAULT_TTL = 300 as const;

/** Maximum allowed time-to-live in seconds (86400 seconds / 24 hours). */
export const MAX_TTL = 86400 as const;

/** Default fallback cache namespace identifier. */
export const DEFAULT_NAMESPACE = 'GENERAL' as const;

/** Default batch size for multi-get / multi-set cache operations. */
export const DEFAULT_BATCH_SIZE = 100 as const;

/** Maximum allowed cache key length in characters. */
export const MAX_CACHE_KEY_LENGTH = 256 as const;

/** Maximum allowed payload size for a cached value in bytes (1 MB). */
export const MAX_CACHE_VALUE_SIZE = 1048576 as const;

/** Global prefix prepended to all generated cache keys. */
export const CACHE_PREFIX = 'ecommerce:cache:' as const;

/** Base path prefix for cache management REST API endpoints. */
export const CACHE_BASE_PATH = '/api/v1/cache' as const;
