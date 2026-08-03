import {
  ICacheEntry,
  ICacheOptions,
  ICacheProvider,
  ICacheStatistics,
} from '../interfaces/cache.interfaces';
import { CacheKey, CacheValue } from '../types/cache.types';
import { CacheNamespace, CacheProvider } from '../enums/cache.enums';
import { CacheStore } from '../storage/cache.store';
import { CacheEntryRecord } from '../storage/cache.entry';
import { DEFAULT_CACHE_CONFIG, ICacheConfig } from '../config/cache.config';

/**
 * Enterprise Production In-Memory Cache Provider (Module 26.2).
 *
 * Implements ICacheProvider interface using the high-performance in-memory CacheStore engine,
 * LRU eviction policies, and TTL expiration controls.
 */
export class MemoryCacheProvider implements ICacheProvider {
  constructor(
    private readonly store: CacheStore = new CacheStore(),
    private readonly config: IJobConfigLike = DEFAULT_CACHE_CONFIG
  ) {}

  /**
   * Helper converting CacheEntryRecord to public ICacheEntry interface.
   */
  private mapRecordToEntry<T>(record: CacheEntryRecord<T>): ICacheEntry<T> {
    return {
      key: record.key,
      namespace: record.namespace,
      value: record.value,
      ttl: record.ttl,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
      sizeBytes: record.sizeBytes,
    };
  }

  /**
   * Retrieves a cached entry by key.
   */
  async get<T = unknown>(key: CacheKey): Promise<ICacheEntry<T> | null> {
    if (!key || typeof key !== 'string') return null;
    const record = this.store.get<T>(key.trim());
    return record ? this.mapRecordToEntry(record) : null;
  }

  /**
   * Stores a payload in the in-memory cache store.
   */
  async set<T = unknown>(key: CacheKey, value: CacheValue<T>, options?: ICacheOptions): Promise<boolean> {
    if (!key || typeof key !== 'string' || !key.trim()) return false;
    const safeOptions: ICacheOptions = {
      ttl: options?.ttl || this.config.defaultTTL,
      namespace: options?.namespace || CacheNamespace.SETTINGS,
      ...options,
    };

    return this.store.set<T>(key.trim(), value, safeOptions);
  }

  /**
   * Stores multiple key-value pairs in a bulk operation.
   */
  async setMany<T = unknown>(
    entries: Array<{ key: CacheKey; value: CacheValue<T>; options?: ICacheOptions }>
  ): Promise<boolean> {
    if (!entries || entries.length === 0) return true;
    let allSuccess = true;

    for (const item of entries) {
      const ok = await this.set<T>(item.key, item.value, item.options);
      if (!ok) allSuccess = false;
    }

    return allSuccess;
  }

  /**
   * Retrieves multiple cached entries by key array.
   */
  async getMany<T = unknown>(keys: CacheKey[]): Promise<Record<CacheKey, ICacheEntry<T> | null>> {
    const result: Record<CacheKey, ICacheEntry<T> | null> = {};
    if (!keys || keys.length === 0) return result;

    for (const k of keys) {
      result[k] = await this.get<T>(k);
    }

    return result;
  }

  /**
   * Removes a single entry from the cache by key.
   */
  async delete(key: CacheKey): Promise<boolean> {
    if (!key || typeof key !== 'string') return false;
    return this.store.remove(key.trim());
  }

  /**
   * Removes multiple entries from the cache by key array.
   */
  async deleteMany(keys: CacheKey[]): Promise<number> {
    if (!keys || keys.length === 0) return 0;
    let count = 0;

    for (const k of keys) {
      if (this.store.remove(k)) {
        count += 1;
      }
    }

    return count;
  }

  /**
   * Checks if a key exists in the cache and is unexpired.
   */
  async exists(key: CacheKey): Promise<boolean> {
    if (!key || typeof key !== 'string') return false;
    return this.store.has(key.trim());
  }

  /**
   * Purges all entries matching optional namespace or clears entire store.
   */
  async clear(namespace?: CacheNamespace | string): Promise<boolean> {
    return this.store.clear(namespace);
  }

  /**
   * Returns low-level operational statistics metrics.
   */
  async statistics(): Promise<ICacheStatistics> {
    const metrics = this.store.getMetrics();
    return {
      provider: CacheProvider.MEMORY,
      metrics,
      byNamespace: {},
      topKeys: [],
    };
  }
}

interface IJobConfigLike extends Partial<ICacheConfig> {
  defaultTTL: number;
}
