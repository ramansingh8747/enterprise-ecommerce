import { CacheKey } from '../types/cache.types';
import { CacheEntryRecord } from './cache.entry';

/**
 * Enterprise Cache Expiration Manager (Module 26.2).
 *
 * Provides expiration validation, remaining TTL calculation, and background
 * scanning to identify and purge expired cache entries.
 */
export class ExpirationManager {
  /**
   * Checks whether a cache entry is expired.
   *
   * @param entry Cache entry record.
   * @returns True if expired.
   */
  isExpired<T = unknown>(entry?: CacheEntryRecord<T> | null): boolean {
    if (!entry) return true;
    return entry.isExpired();
  }

  /**
   * Calculates remaining time-to-live in seconds for an entry.
   *
   * @param entry Cache entry record.
   * @returns Remaining TTL in seconds (0 if expired).
   */
  calculateRemainingTTL<T = unknown>(entry: CacheEntryRecord<T>): number {
    if (this.isExpired(entry)) return 0;
    const remainingMs = entry.expiresAt.getTime() - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  }

  /**
   * Scans an in-memory entry map and purges expired records.
   *
   * @param entries Target entry map.
   * @returns Summary of purged keys and total count.
   */
  scanAndClean<T = unknown>(
    entries: Map<CacheKey, CacheEntryRecord<T>>
  ): { purgedKeys: CacheKey[]; purgedCount: number } {
    const purgedKeys: CacheKey[] = [];

    for (const [key, entry] of entries.entries()) {
      if (entry.isExpired()) {
        purgedKeys.push(key);
        entries.delete(key);
      }
    }

    return {
      purgedKeys,
      purgedCount: purgedKeys.length,
    };
  }
}
