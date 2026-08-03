import { CacheNamespace } from '../enums/cache.enums';

/**
 * Enterprise Caching Engine — Shared Types (Module 26.1).
 *
 * Core domain types and payload shapes consumed across cache providers, services,
 * utilities, and controllers.
 */

/** Type alias representing a sanitized cache key string. */
export type CacheKey = string;

/** Type representing arbitrary serializable cached values. */
export type CacheValue<T = unknown> = T;

/**
 * Criteria options for filtering and querying cache keys.
 */
export type CacheFilters = {
  namespace?: CacheNamespace | string;
  pattern?: string;
  expiredOnly?: boolean;
  minTTL?: number;
  maxTTL?: number;
};

/**
 * Pagination options for cache key list queries.
 */
export type CachePagination = {
  page: number;
  limit: number;
};

/**
 * Combined options for cache search operations.
 */
export type CacheSearchOptions = {
  filters?: CacheFilters;
  pagination?: CachePagination;
};

/**
 * Operational metrics tracking hit/miss ratios and memory usage.
 */
export type CacheMetrics = {
  hits: number;
  misses: number;
  hitRatio: number;
  totalKeys: number;
  memoryBytes: number;
  evictions: number;
};

/**
 * High-level summary metrics card for cache overview dashboards.
 */
export type CacheSummary = {
  totalEntries: number;
  activeNamespaces: number;
  hitRatePercentage: number;
  memoryUsageFormatted: string;
};
