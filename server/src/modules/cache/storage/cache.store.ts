import { CacheNamespace } from '../enums/cache.enums';
import { CacheKey, CacheMetrics, CacheValue } from '../types/cache.types';
import { CacheEntryRecord } from './cache.entry';
import { ExpirationManager } from './expiration.manager';
import { IEvictionStrategy, LruEvictionStrategy } from './eviction.policy';
import { ICacheOptions } from '../interfaces/cache.interfaces';
import { MAX_CACHE_VALUE_SIZE } from '../constants/cache.constants';

/**
 * Enterprise Core In-Memory Cache Store Engine (Module 26.2).
 *
 * Underlying storage engine managing in-memory entry maps, namespace partitioning,
 * access metrics, atomic updates, size tracking, and eviction triggers.
 */
export class CacheStore {
  private readonly store = new Map<CacheKey, CacheEntryRecord<unknown>>();
  private readonly namespaceMap = new Map<string, Set<CacheKey>>();

  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private expirations = 0;
  private totalMemoryBytes = 0;

  constructor(
    private readonly maxEntries: number = 10000,
    private readonly maxMemoryBytes: number = 100 * 1024 * 1024, // 100 MB
    private readonly evictionStrategy: IEvictionStrategy = new LruEvictionStrategy(),
    private readonly expirationManager: ExpirationManager = new ExpirationManager()
  ) {}

  /**
   * Helper indexing key in namespace set.
   */
  private indexNamespace(namespace: string, key: CacheKey): void {
    if (!this.namespaceMap.has(namespace)) {
      this.namespaceMap.set(namespace, new Set<CacheKey>());
    }
    this.namespaceMap.get(namespace)?.add(key);
  }

  /**
   * Helper removing key from namespace set.
   */
  private unindexNamespace(namespace: string, key: CacheKey): void {
    const set = this.namespaceMap.get(namespace);
    if (set) {
      set.delete(key);
      if (set.size === 0) {
        this.namespaceMap.delete(namespace);
      }
    }
  }

  /**
   * Triggers eviction when max entries or max memory is exceeded.
   */
  private enforceCapacityBudget(): void {
    if (this.store.size <= this.maxEntries && this.totalMemoryBytes <= this.maxMemoryBytes) {
      return;
    }

    // 1. Purge expired entries first
    const { purgedKeys, purgedCount } = this.expirationManager.scanAndClean(this.store);
    purgedKeys.forEach((key) => {
      this.expirations += 1;
    });

    if (this.store.size <= this.maxEntries && this.totalMemoryBytes <= this.maxMemoryBytes) {
      return;
    }

    // 2. Select victim keys via Eviction Strategy
    const countToEvict = Math.max(1, Math.ceil(this.store.size * 0.1)); // Evict 10%
    const victimKeys = this.evictionStrategy.selectVictims(this.store, countToEvict);

    victimKeys.forEach((key) => {
      this.remove(key);
      this.evictions += 1;
    });
  }

  /**
   * Retrieves an unexpired entry from the cache.
   *
   * @param key Target cache key.
   * @returns CacheEntryRecord or null on miss/expiration.
   */
  get<T = unknown>(key: CacheKey): CacheEntryRecord<T> | null {
    const entry = this.store.get(key) as CacheEntryRecord<T> | undefined;

    if (!entry) {
      this.misses += 1;
      return null;
    }

    if (this.expirationManager.isExpired(entry)) {
      this.misses += 1;
      this.expirations += 1;
      this.remove(key);
      return null;
    }

    this.hits += 1;
    entry.touch();
    return entry;
  }

  /**
   * Stores a payload entry in the cache.
   *
   * @param key Target cache key.
   * @param value Serializable payload.
   * @param options Caching options (ttl, namespace, etc.).
   */
  set<T = unknown>(key: CacheKey, value: CacheValue<T>, options?: ICacheOptions): boolean {
    const ttl = options?.ttl || 300;
    const namespace = options?.namespace || CacheNamespace.SETTINGS;

    const estimatedSize = CacheEntryRecord.estimateSizeBytes(value);
    if (estimatedSize > MAX_CACHE_VALUE_SIZE) {
      console.warn(`[CacheStore] Payload size for key '${key}' exceeds MAX_CACHE_VALUE_SIZE limit (${estimatedSize} bytes).`);
      return false;
    }

    // Overwrite existing key if present
    if (this.store.has(key)) {
      this.remove(key);
    }

    this.enforceCapacityBudget();

    const record = new CacheEntryRecord<T>(key, value, ttl, namespace, options?.tags);
    this.store.set(key, record as CacheEntryRecord<unknown>);
    this.indexNamespace(String(namespace), key);
    this.totalMemoryBytes += record.sizeBytes;

    return true;
  }

  /**
   * Removes a key from the cache store.
   *
   * @param key Target cache key.
   * @returns True if removed.
   */
  remove(key: CacheKey): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    this.store.delete(key);
    this.unindexNamespace(String(entry.namespace), key);
    this.totalMemoryBytes = Math.max(0, this.totalMemoryBytes - entry.sizeBytes);
    return true;
  }

  /**
   * Checks whether a unexpired key exists in store.
   *
   * @param key Target cache key.
   */
  has(key: CacheKey): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (this.expirationManager.isExpired(entry)) {
      this.remove(key);
      return false;
    }
    return true;
  }

  /**
   * Purges entries matching namespace or clears entire store.
   *
   * @param namespace Optional target namespace.
   */
  clear(namespace?: CacheNamespace | string): boolean {
    if (!namespace) {
      this.store.clear();
      this.namespaceMap.clear();
      this.totalMemoryBytes = 0;
      return true;
    }

    const normNs = String(namespace).trim().toUpperCase();
    const keys = this.namespaceMap.get(normNs);
    if (!keys) return true;

    Array.from(keys).forEach((key) => this.remove(key));
    this.namespaceMap.delete(normNs);
    return true;
  }

  /**
   * Returns current cache operational metrics.
   */
  getMetrics(): CacheMetrics {
    const totalOps = this.hits + this.misses;
    const hitRatio = totalOps > 0 ? parseFloat((this.hits / totalOps).toFixed(4)) : 1.0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRatio,
      totalKeys: this.store.size,
      memoryBytes: this.totalMemoryBytes,
      evictions: this.evictions,
    };
  }

  /**
   * Returns list of keys belonging to a namespace.
   *
   * @param namespace Target namespace string.
   */
  getKeysByNamespace(namespace: string): CacheKey[] {
    const set = this.namespaceMap.get(String(namespace).trim().toUpperCase());
    return set ? Array.from(set) : [];
  }
}
