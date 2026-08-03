import { CacheKey } from '../types/cache.types';
import { CacheEntryRecord } from './cache.entry';

/**
 * Eviction Strategy Interface Contract (Module 26.2).
 */
export interface IEvictionStrategy {
  /**
   * Identifies and selects candidate cache keys for eviction when memory budget is exceeded.
   *
   * @param entries Current in-memory entry map.
   * @param countNeeded Number of candidate keys required to evict.
   * @returns Array of target keys selected for removal.
   */
  selectVictims<T = unknown>(
    entries: Map<CacheKey, CacheEntryRecord<T>>,
    countNeeded: number
  ): CacheKey[];
}

/**
 * LRU (Least Recently Used) Eviction Strategy Implementation.
 * Evicts entries with the oldest lastAccessedAt timestamp.
 */
export class LruEvictionStrategy implements IEvictionStrategy {
  selectVictims<T = unknown>(
    entries: Map<CacheKey, CacheEntryRecord<T>>,
    countNeeded: number
  ): CacheKey[] {
    if (entries.size === 0 || countNeeded <= 0) return [];

    const sorted = Array.from(entries.values()).sort(
      (a, b) => a.lastAccessedAt.getTime() - b.lastAccessedAt.getTime()
    );

    return sorted.slice(0, countNeeded).map((entry) => entry.key);
  }
}

/**
 * FIFO (First In First Out) Eviction Strategy Implementation.
 * Evicts entries with the oldest createdAt timestamp.
 */
export class FifoEvictionStrategy implements IEvictionStrategy {
  selectVictims<T = unknown>(
    entries: Map<CacheKey, CacheEntryRecord<T>>,
    countNeeded: number
  ): CacheKey[] {
    if (entries.size === 0 || countNeeded <= 0) return [];

    const sorted = Array.from(entries.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    return sorted.slice(0, countNeeded).map((entry) => entry.key);
  }
}
