import {
  IRateLimitEntry,
  IRateLimitOptions,
  IRateLimitProvider,
  IRateLimitStatistics,
} from '../interfaces/rate-limit.interfaces';
import { RateLimitStore } from '../storage/rate-limit.store';

/**
 * Production In-Memory Rate Limit Provider (Module 28.2).
 *
 * Implements IRateLimitProvider using an in-memory RateLimitStore engine.
 * Suitable for single-instance deployments, testing, and high-performance in-memory caching.
 */
export class MemoryRateLimitProvider implements IRateLimitProvider {
  constructor(private readonly store: RateLimitStore = new RateLimitStore()) {}

  /**
   * Consumes 1 hit against specified key in memory store.
   */
  async consume(key: string, options: IRateLimitOptions): Promise<IRateLimitEntry> {
    return this.store.consume(key, options);
  }

  /**
   * Resets rate limit quota for specified key.
   */
  async reset(key: string): Promise<boolean> {
    return this.store.reset(key);
  }

  /**
   * Resets rate limit quotas for multiple keys.
   */
  async resetMany(keys: string[]): Promise<number> {
    return this.store.resetMany(keys);
  }

  /**
   * Retrieves current rate limit entry without consuming hits.
   */
  async get(key: string): Promise<IRateLimitEntry | null> {
    return this.store.get(key);
  }

  /**
   * Checks whether an active entry exists for a key.
   */
  async exists(key: string): Promise<boolean> {
    return this.store.exists(key);
  }

  /**
   * Scans store and purges expired rate limit records.
   */
  async cleanupExpired(): Promise<number> {
    return this.store.cleanupExpired();
  }

  /**
   * Returns aggregate statistics metrics.
   */
  async statistics(): Promise<IRateLimitStatistics> {
    const stats = this.store.getStatistics();
    return {
      activeKeysCount: stats.activeKeysCount,
      blockedClientsCount: 0,
      whitelistedClientsCount: 0,
      metrics: {
        totalEvaluations: stats.totalEvaluations,
        allowedCount: stats.totalAllowed,
        limitedCount: stats.totalLimited,
        blockedCount: 0,
        whitelistedCount: 0,
        averageResponseTimeMs: 0.05,
      },
    };
  }
}
