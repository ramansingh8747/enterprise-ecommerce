import { RateLimitEntryRecord } from './rate-limit.entry';
import { WindowManager } from './window.manager';
import { IRateLimitOptions } from '../interfaces/rate-limit.interfaces';
import { RateLimitScope, RateLimitStatus, RateLimitStrategy } from '../enums/rate-limit.enums';

/**
 * Enterprise Production In-Memory Rate Limit Storage Engine (Module 28.2).
 *
 * Thread-safe Map storage engine providing atomic request consumption, window reset math,
 * expired record eviction, penalty block management, and memory usage estimation.
 */
export class RateLimitStore {
  private readonly store = new Map<string, RateLimitEntryRecord>();
  private totalEvaluations = 0;
  private totalAllowed = 0;
  private totalLimited = 0;

  /**
   * Retrieves an active entry from memory without consuming hits.
   *
   * @param key Unique storage key string.
   */
  get(key: string): RateLimitEntryRecord | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.isExpired() && !entry.isBlocked()) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Atomically consumes 1 hit against a rate-limited key, resetting windows when expired.
   *
   * @param key Storage key string.
   * @param options Rate limit options (maxRequests, windowMs, strategy, scope).
   */
  consume(key: string, options: IRateLimitOptions): RateLimitEntryRecord {
    this.totalEvaluations++;
    const now = Date.now();
    const windowMs = options.windowMs || 60000;
    const maxRequests = options.maxRequests || 100;
    const strategy = options.strategy || RateLimitStrategy.FIXED_WINDOW;
    const scope = options.scope || RateLimitScope.IP;
    const identifier = key.split(':').pop() || 'unknown';

    let entry = this.store.get(key);

    // 1. If key is currently blocked, retain blocked status
    if (entry && entry.isBlocked(now)) {
      this.totalLimited++;
      entry.hits++;
      entry.updatedAt = new Date(now);
      return entry;
    }

    // 2. If key doesn't exist or previous window expired, initialize new window
    if (!entry || entry.isExpired(now)) {
      const { resetTimeMs } = WindowManager.calculateWindow(windowMs, strategy, now);

      entry = new RateLimitEntryRecord({
        key,
        identifier,
        scope,
        strategy,
        hits: 1,
        remaining: Math.max(0, maxRequests - 1),
        resetTimeMs,
        status: maxRequests >= 1 ? RateLimitStatus.ALLOWED : RateLimitStatus.LIMITED,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      });

      this.store.set(key, entry);
      if (entry.status === RateLimitStatus.ALLOWED) this.totalAllowed++;
      else this.totalLimited++;

      return entry;
    }

    // 3. Existing window active: increment hit count
    entry.hits++;
    entry.updatedAt = new Date(now);

    if (entry.hits > maxRequests) {
      entry.remaining = 0;
      entry.status = RateLimitStatus.LIMITED;
      this.totalLimited++;
    } else {
      entry.remaining = Math.max(0, maxRequests - entry.hits);
      entry.status = RateLimitStatus.ALLOWED;
      this.totalAllowed++;
    }

    return entry;
  }

  /**
   * Resets rate limit quota for a single key.
   */
  reset(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Resets rate limit quotas for multiple keys.
   */
  resetMany(keys: string[]): number {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) count++;
    }
    return count;
  }

  /**
   * Checks whether an active entry exists for a key.
   */
  exists(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Scans memory store and evicts expired records.
   *
   * @param now Current timestamp in milliseconds. Defaults to Date.now().
   * @returns Total evicted entry count.
   */
  cleanupExpired(now: number = Date.now()): number {
    let evictedCount = 0;
    for (const [key, entry] of this.store.entries()) {
      if (entry.isExpired(now) && !entry.isBlocked(now)) {
        this.store.delete(key);
        evictedCount++;
      }
    }
    return evictedCount;
  }

  /**
   * Estimates total heap memory consumption of all stored entries in bytes.
   */
  estimateTotalMemoryBytes(): number {
    let totalBytes = 0;
    for (const entry of this.store.values()) {
      totalBytes += entry.estimateByteSize();
    }
    return totalBytes;
  }

  /**
   * Returns active entry count.
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Returns operational storage statistics.
   */
  getStatistics(): {
    activeKeysCount: number;
    totalEvaluations: number;
    totalAllowed: number;
    totalLimited: number;
    memoryEstimateBytes: number;
  } {
    return {
      activeKeysCount: this.store.size,
      totalEvaluations: this.totalEvaluations,
      totalAllowed: this.totalAllowed,
      totalLimited: this.totalLimited,
      memoryEstimateBytes: this.estimateTotalMemoryBytes(),
    };
  }
}
