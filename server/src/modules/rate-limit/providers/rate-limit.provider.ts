import {
  IRateLimitEntry,
  IRateLimitOptions,
  IRateLimitProvider,
  IRateLimitStatistics,
} from '../interfaces/rate-limit.interfaces';
import { RateLimitScope, RateLimitStatus } from '../enums/rate-limit.enums';

/**
 * Enterprise Abstract Rate Limit Provider Base Class (Module 28.1).
 *
 * Base class defining the contract for rate limit storage engines (Memory, Redis, Mongo).
 * Implements IRateLimitProvider with default fallback hooks.
 */
export abstract class AbstractRateLimitProvider implements IRateLimitProvider {
  /**
   * Consumes 1 request hit against specified key.
   */
  async consume(key: string, options: IRateLimitOptions): Promise<IRateLimitEntry> {
    const maxRequests = options.maxRequests || 100;
    const windowMs = options.windowMs || 60000;
    const now = Date.now();

    return {
      key,
      scope: options.scope || RateLimitScope.IP,
      identifier: key.split(':').pop() || 'unknown',
      hits: 1,
      remaining: Math.max(0, maxRequests - 1),
      resetTimeMs: now + windowMs,
      status: RateLimitStatus.ALLOWED,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  /**
   * Resets rate limit entry for specified key.
   */
  async reset(_key: string): Promise<boolean> {
    return true;
  }

  /**
   * Resets rate limit entries for multiple keys.
   */
  async resetMany(keys: string[]): Promise<number> {
    return keys.length;
  }

  /**
   * Retrieves current rate limit entry without consuming hits.
   */
  async get(_key: string): Promise<IRateLimitEntry | null> {
    return null;
  }

  /**
   * Checks whether an active entry exists for a key.
   */
  async exists(_key: string): Promise<boolean> {
    return false;
  }

  /**
   * Returns aggregate statistics.
   */
  async statistics(): Promise<IRateLimitStatistics> {
    return {
      activeKeysCount: 0,
      blockedClientsCount: 0,
      whitelistedClientsCount: 0,
      metrics: {
        totalEvaluations: 0,
        allowedCount: 0,
        limitedCount: 0,
        blockedCount: 0,
        whitelistedCount: 0,
        averageResponseTimeMs: 0,
      },
    };
  }
}
