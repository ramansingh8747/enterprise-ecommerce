import {
  ICacheEntry,
  ICacheInvalidation,
  ICacheOptions,
  ICacheProvider,
  ICacheService,
  ICacheStatistics,
} from '../interfaces/cache.interfaces';
import { CacheKey, CacheValue } from '../types/cache.types';
import { CacheNamespace, CacheStatus, CacheStrategy } from '../enums/cache.enums';
import { CacheKeyUtil } from '../utils/cache-key.util';
import { DEFAULT_CACHE_CONFIG, ICacheConfig } from '../config/cache.config';
import { DEFAULT_TTL, MAX_TTL } from '../constants/cache.constants';

/**
 * Enterprise Cache Application Service Implementation (Module 26.3).
 *
 * Primary application service orchestrator for caching operations.
 * Manages read-through caching, invalidation logic, bulk warmup operations,
 * and statistical reporting.
 * Implements ICacheService contract (Dependency Inversion Principle).
 */
export class CacheService implements ICacheService {
  constructor(
    private readonly cacheProvider: ICacheProvider,
    private readonly config: ICacheConfig = DEFAULT_CACHE_CONFIG
  ) {}

  /* ========================================================================
     PRIVATE VALIDATION & SANITIZATION HELPERS
     ====================================================================== */

  /**
   * Validates and normalizes a cache key input.
   * Throws an Error if key is invalid.
   */
  private normalizeKey(key: CacheKey): string {
    if (!CacheKeyUtil.validateKey(key)) {
      throw new Error(`Invalid cache key provided: '${key}'`);
    }
    return CacheKeyUtil.normalizeKey(key);
  }

  /**
   * Normalizes domain namespace identifier string.
   */
  private normalizeNamespace(namespace?: CacheNamespace | string): string {
    if (!namespace) return String(CacheNamespace.SETTINGS);
    return CacheKeyUtil.buildNamespace(String(namespace));
  }

  /**
   * Normalizes time-to-live seconds within configured bounds.
   */
  private normalizeTTL(ttl?: number): number {
    if (ttl === undefined || ttl === null || ttl <= 0) {
      return this.config.defaultTTL || DEFAULT_TTL;
    }
    return Math.min(ttl, MAX_TTL);
  }

  /**
   * Constructs standardized ICacheOptions with defaults.
   */
  private buildCacheOptions(options?: ICacheOptions): ICacheOptions {
    return {
      ttl: this.normalizeTTL(options?.ttl),
      namespace: this.normalizeNamespace(options?.namespace),
      strategy: options?.strategy || this.config.defaultStrategy || CacheStrategy.CACHE_FIRST,
      tags: options?.tags || [],
    };
  }

  /* ========================================================================
     PUBLIC SERVICE METHODS
     ====================================================================== */

  /**
   * Retrieves value from cache or falls back to executing a data fetch function.
   *
   * @param key Target cache key.
   * @param fetcher Async function producing data on cache miss.
   * @param options Caching options.
   */
  async get<T = unknown>(
    key: CacheKey,
    fetcher?: () => Promise<T>,
    options?: ICacheOptions
  ): Promise<{ value: T | null; status: CacheStatus }> {
    const normKey = this.normalizeKey(key);
    const opts = this.buildCacheOptions(options);

    try {
      const entry = await this.cacheProvider.get<T>(normKey);

      if (entry) {
        return { value: entry.value, status: CacheStatus.HIT };
      }

      // Cache Miss — Check if fetcher function is available
      if (fetcher && typeof fetcher === 'function') {
        const freshData = await fetcher();
        if (freshData !== undefined && freshData !== null) {
          await this.set(normKey, freshData, opts);
          return { value: freshData, status: CacheStatus.REFRESHED };
        }
      }

      return { value: null, status: CacheStatus.MISS };
    } catch (error) {
      console.error(`[CacheService] Error during get operation for key '${normKey}':`, error);
      if (fetcher && typeof fetcher === 'function') {
        try {
          const freshData = await fetcher();
          return { value: freshData, status: CacheStatus.MISS };
        } catch (fetchErr) {
          throw fetchErr;
        }
      }
      return { value: null, status: CacheStatus.MISS };
    }
  }

  /**
   * Retrieves multiple cached entries by key array.
   *
   * @param keys Array of target cache keys.
   */
  async getMany<T = unknown>(
    keys: CacheKey[]
  ): Promise<Record<CacheKey, { value: T | null; status: CacheStatus }>> {
    const result: Record<CacheKey, { value: T | null; status: CacheStatus }> = {};
    if (!keys || keys.length === 0) return result;

    const normKeys = keys.map((k) => CacheKeyUtil.normalizeKey(k));
    const entries = await this.cacheProvider.getMany<T>(normKeys);

    for (const k of normKeys) {
      const entry = entries[k];
      if (entry) {
        result[k] = { value: entry.value, status: CacheStatus.HIT };
      } else {
        result[k] = { value: null, status: CacheStatus.MISS };
      }
    }

    return result;
  }

  /**
   * Stores a payload in the cache.
   *
   * @param key Target cache key.
   * @param value Serializable payload value.
   * @param options Caching options.
   */
  async set<T = unknown>(
    key: CacheKey,
    value: CacheValue<T>,
    options?: ICacheOptions
  ): Promise<boolean> {
    const normKey = this.normalizeKey(key);
    const opts = this.buildCacheOptions(options);

    try {
      return await this.cacheProvider.set<T>(normKey, value, opts);
    } catch (error) {
      console.error(`[CacheService] Error setting cache key '${normKey}':`, error);
      return false;
    }
  }

  /**
   * Stores multiple key-value pairs in a single bulk operation.
   *
   * @param entries Array of key-value pairs with options.
   */
  async setMany<T = unknown>(
    entries: Array<{ key: CacheKey; value: CacheValue<T>; options?: ICacheOptions }>
  ): Promise<boolean> {
    if (!entries || entries.length === 0) return true;

    const normalizedEntries = entries.map((item) => ({
      key: this.normalizeKey(item.key),
      value: item.value,
      options: this.buildCacheOptions(item.options),
    }));

    try {
      return await this.cacheProvider.setMany<T>(normalizedEntries);
    } catch (error) {
      console.error('[CacheService] Error setting bulk cache entries:', error);
      return false;
    }
  }

  /**
   * Deletes a single key from cache.
   *
   * @param key Target cache key.
   */
  async delete(key: CacheKey): Promise<boolean> {
    const normKey = this.normalizeKey(key);
    try {
      return await this.cacheProvider.delete(normKey);
    } catch (error) {
      console.error(`[CacheService] Error deleting cache key '${normKey}':`, error);
      return false;
    }
  }

  /**
   * Deletes multiple keys from cache.
   *
   * @param keys Array of target cache keys.
   */
  async deleteMany(keys: CacheKey[]): Promise<number> {
    if (!keys || keys.length === 0) return 0;
    const normKeys = keys.map((k) => CacheKeyUtil.normalizeKey(k));

    try {
      return await this.cacheProvider.deleteMany(normKeys);
    } catch (error) {
      console.error('[CacheService] Error deleting bulk cache keys:', error);
      return 0;
    }
  }

  /**
   * Invalidates cached entries matching an invalidation specification.
   *
   * @param invalidation Invalidation criteria (keys, namespace, pattern).
   */
  async invalidate(invalidation: ICacheInvalidation): Promise<number> {
    if (!invalidation) return 0;
    let count = 0;

    // 1. Specific Keys Invalidation
    if (invalidation.keys && invalidation.keys.length > 0) {
      count += await this.deleteMany(invalidation.keys);
    }

    // 2. Target Namespace Invalidation
    if (invalidation.namespace) {
      const ok = await this.clear(invalidation.namespace);
      if (ok) count += 1;
    }

    return count;
  }

  /**
   * Purges all entries matching namespace or clears the entire cache.
   *
   * @param namespace Optional target namespace.
   */
  async clear(namespace?: CacheNamespace | string): Promise<boolean> {
    const normNs = namespace ? this.normalizeNamespace(namespace) : undefined;
    try {
      return await this.cacheProvider.clear(normNs);
    } catch (error) {
      console.error('[CacheService] Error clearing cache store:', error);
      return false;
    }
  }

  /**
   * Warmup cache by pre-populating entries using key-fetcher map.
   *
   * @param items Array of key and fetcher pairs.
   * @param options Caching options.
   */
  async warmup<T = unknown>(
    items: Array<{ key: CacheKey; fetcher: () => Promise<T> }>,
    options?: ICacheOptions
  ): Promise<number> {
    if (!items || items.length === 0) return 0;
    let warmedCount = 0;

    for (const item of items) {
      try {
        const data = await item.fetcher();
        if (data !== undefined && data !== null) {
          const ok = await this.set<T>(item.key, data, options);
          if (ok) warmedCount += 1;
        }
      } catch (err) {
        console.error(`[CacheService] Warmup failed for key '${item.key}':`, err);
      }
    }

    return warmedCount;
  }

  /**
   * Returns analytical statistics and performance metrics for the cache.
   */
  async statistics(): Promise<ICacheStatistics> {
    return this.cacheProvider.statistics();
  }
}
