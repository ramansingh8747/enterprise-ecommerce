import {
  CacheNamespace,
  CacheProvider,
  CacheStatus,
  CacheStrategy,
} from '../enums/cache.enums';
import {
  CacheFilters,
  CacheKey,
  CacheMetrics,
  CachePagination,
  CacheValue,
} from '../types/cache.types';

/**
 * Enterprise Caching Engine — Domain Interfaces (Module 26.1).
 *
 * Fully typed, framework-agnostic contracts establishing interfaces
 * for cache entries, options, providers, services, statistics, contexts, and invalidations.
 */

/**
 * Encapsulates stored metadata and payload of an individual cache entry.
 */
export interface ICacheEntry<T = unknown> {
  /** Full sanitized cache key. */
  key: CacheKey;
  /** Domain entity namespace. */
  namespace: CacheNamespace | string;
  /** Cached payload value. */
  value: CacheValue<T>;
  /** Time-to-live in seconds. */
  ttl: number;
  /** Timestamp when the entry was created. */
  createdAt: Date;
  /** Timestamp when the entry expires. */
  expiresAt: Date;
  /** Entry size in bytes. */
  sizeBytes: number;
}

/**
 * Configuration options supplied when setting or retrieving a cache entry.
 */
export interface ICacheOptions {
  /** Custom time-to-live in seconds (overrides default TTL). */
  ttl?: number;
  /** Domain namespace for partition grouping. */
  namespace?: CacheNamespace | string;
  /** Caching strategy override. */
  strategy?: CacheStrategy;
  /** Classification tags attached for group invalidation. */
  tags?: string[];
}

/**
 * Contextual tracking metadata attached to cache operations.
 */
export interface ICacheContext {
  /** Execution operation context ID. */
  contextId: string;
  /** Active cache provider. */
  provider: CacheProvider;
  /** Request tracking ID if initiated via HTTP request. */
  requestId?: string;
  /** Correlation ID for distributed tracing. */
  correlationId?: string;
}

/**
 * Specification details for invalidating targeted cache entries.
 */
export interface ICacheInvalidation {
  /** Target namespace to invalidate. */
  namespace?: CacheNamespace | string;
  /** Key prefix or glob pattern to invalidate. */
  pattern?: string;
  /** Array of specific keys to invalidate. */
  keys?: CacheKey[];
  /** Target classification tags to invalidate. */
  tags?: string[];
}

/**
 * Aggregate statistics report produced by the caching system.
 */
export interface ICacheStatistics {
  provider: CacheProvider;
  metrics: CacheMetrics;
  byNamespace: Record<string, number>;
  topKeys: Array<{ key: string; hits: number }>;
}

/**
 * Low-level Cache Provider contract for storage transport engines.
 */
export interface ICacheProvider {
  /**
   * Retrieves a cached entry by key.
   *
   * @param key Target cache key.
   */
  get<T = unknown>(key: CacheKey): Promise<ICacheEntry<T> | null>;

  /**
   * Stores a payload in the cache with options.
   *
   * @param key Target cache key.
   * @param value Serializable payload value.
   * @param options Caching options (TTL, namespace, etc.).
   */
  set<T = unknown>(key: CacheKey, value: CacheValue<T>, options?: ICacheOptions): Promise<boolean>;

  /**
   * Stores multiple key-value pairs in a single bulk operation.
   *
   * @param entries Array of key-value pairs with options.
   */
  setMany<T = unknown>(
    entries: Array<{ key: CacheKey; value: CacheValue<T>; options?: ICacheOptions }>
  ): Promise<boolean>;

  /**
   * Retrieves multiple cached entries by key array.
   *
   * @param keys Array of target cache keys.
   */
  getMany<T = unknown>(keys: CacheKey[]): Promise<Record<CacheKey, ICacheEntry<T> | null>>;

  /**
   * Removes a single entry from the cache by key.
   *
   * @param key Target cache key.
   */
  delete(key: CacheKey): Promise<boolean>;

  /**
   * Removes multiple entries from the cache by key array.
   *
   * @param keys Array of target cache keys.
   */
  deleteMany(keys: CacheKey[]): Promise<number>;

  /**
   * Checks if a key exists in the cache and is unexpired.
   *
   * @param key Target cache key.
   */
  exists(key: CacheKey): Promise<boolean>;

  /**
   * Purges all entries matching optional namespace or clears entire store.
   *
   * @param namespace Optional target namespace.
   */
  clear(namespace?: CacheNamespace | string): Promise<boolean>;

  /**
   * Returns low-level operational statistics metrics.
   */
  statistics(): Promise<ICacheStatistics>;
}

/**
 * High-level Application Cache Service contract (Dependency Inversion Principle).
 */
export interface ICacheService {
  /**
   * Retrieves value from cache or falls back to executing a data fetch function.
   *
   * @param key Target cache key.
   * @param fetcher Async function producing data on cache miss.
   * @param options Caching options.
   */
  get<T = unknown>(
    key: CacheKey,
    fetcher?: () => Promise<T>,
    options?: ICacheOptions
  ): Promise<{ value: T | null; status: CacheStatus }>;

  /**
   * Retrieves multiple cached entries by key array.
   */
  getMany<T = unknown>(
    keys: CacheKey[]
  ): Promise<Record<CacheKey, { value: T | null; status: CacheStatus }>>;

  /**
   * Stores a payload in the cache.
   *
   * @param key Target cache key.
   * @param value Serializable payload.
   * @param options Caching options.
   */
  set<T = unknown>(key: CacheKey, value: CacheValue<T>, options?: ICacheOptions): Promise<boolean>;

  /**
   * Stores multiple key-value pairs in a single bulk operation.
   */
  setMany<T = unknown>(
    entries: Array<{ key: CacheKey; value: CacheValue<T>; options?: ICacheOptions }>
  ): Promise<boolean>;

  /**
   * Deletes a single key from cache.
   *
   * @param key Target cache key.
   */
  delete(key: CacheKey): Promise<boolean>;

  /**
   * Deletes multiple keys from cache.
   */
  deleteMany(keys: CacheKey[]): Promise<number>;

  /**
   * Invalidates cached entries matching an invalidation specification.
   *
   * @param invalidation Invalidation criteria.
   */
  invalidate(invalidation: ICacheInvalidation): Promise<number>;

  /**
   * Purges all entries matching namespace or clears the entire cache.
   *
   * @param namespace Optional target namespace.
   */
  clear(namespace?: CacheNamespace | string): Promise<boolean>;

  /**
   * Warmup cache by pre-populating entries using key-fetcher map.
   *
   * @param items Array of key and fetcher pairs.
   * @param options Caching options.
   */
  warmup<T = unknown>(
    items: Array<{ key: CacheKey; fetcher: () => Promise<T> }>,
    options?: ICacheOptions
  ): Promise<number>;

  /**
   * Returns analytical statistics and performance metrics for the cache.
   */
  statistics(): Promise<ICacheStatistics>;
}
