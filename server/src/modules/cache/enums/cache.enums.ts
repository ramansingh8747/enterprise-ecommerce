/**
 * Enterprise Caching Engine — Shared Enumerations (Module 26.1).
 *
 * Centralized domain enums representing cache providers, caching strategies,
 * entry statuses, and entity namespaces across the platform.
 */

/**
 * Supported caching engine providers.
 */
export enum CacheProvider {
  MEMORY = 'MEMORY',
  REDIS  = 'REDIS',
  HYBRID = 'HYBRID',
}

/**
 * Caching strategies for data fetch and write operations.
 */
export enum CacheStrategy {
  CACHE_FIRST            = 'CACHE_FIRST',
  NETWORK_FIRST          = 'NETWORK_FIRST',
  STALE_WHILE_REVALIDATE = 'STALE_WHILE_REVALIDATE',
  WRITE_THROUGH          = 'WRITE_THROUGH',
  WRITE_BEHIND           = 'WRITE_BEHIND',
  READ_THROUGH           = 'READ_THROUGH',
}

/**
 * Cache operation lookup statuses.
 */
export enum CacheStatus {
  HIT         = 'HIT',
  MISS        = 'MISS',
  EXPIRED     = 'EXPIRED',
  REFRESHED   = 'REFRESHED',
  INVALIDATED = 'INVALIDATED',
}

/**
 * Domain entity namespaces for key partitioning and targeted invalidation.
 */
export enum CacheNamespace {
  PRODUCT   = 'PRODUCT',
  CATEGORY  = 'CATEGORY',
  BRAND     = 'BRAND',
  INVENTORY = 'INVENTORY',
  ORDER     = 'ORDER',
  USER      = 'USER',
  SESSION   = 'SESSION',
  SEARCH    = 'SEARCH',
  ANALYTICS = 'ANALYTICS',
  SETTINGS  = 'SETTINGS',
}
