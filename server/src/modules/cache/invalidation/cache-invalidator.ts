import { ICacheInvalidation, ICacheService } from '../interfaces/cache.interfaces';
import { CacheNamespace } from '../enums/cache.enums';
import { InvalidationRulesManager } from './invalidation.rules';

/**
 * Enterprise Cache Invalidator Engine (Module 26.4).
 *
 * High-level invalidation orchestrator delegating key, namespace, pattern,
 * and rule-based entity invalidations to the ICacheService abstraction.
 */
export class CacheInvalidator {
  constructor(private readonly cacheService: ICacheService) {}

  /**
   * Invalidates a single specific cache key.
   *
   * @param key Target cache key.
   */
  async invalidateKey(key: string): Promise<boolean> {
    return this.cacheService.delete(key);
  }

  /**
   * Purges all entries belonging to a specified domain namespace.
   *
   * @param namespace Target domain namespace.
   */
  async invalidateNamespace(namespace: CacheNamespace | string): Promise<boolean> {
    return this.cacheService.clear(namespace);
  }

  /**
   * Invalidates all cache namespaces and tags affected by a domain entity mutation.
   *
   * @param entity Name of mutated entity (e.g., 'PRODUCT', 'ORDER').
   * @param entityId Optional specific entity ID.
   */
  async invalidateEntity(entity: string, entityId?: string): Promise<number> {
    const targets = InvalidationRulesManager.resolveInvalidationTargets(entity, entityId);
    let totalCount = 0;

    for (const target of targets) {
      const count = await this.cacheService.invalidate(target);
      totalCount += count;
    }

    return totalCount;
  }

  /**
   * Invalidates cache entries matching a logical pattern string.
   *
   * @param pattern Matching glob/regex pattern string.
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    return this.cacheService.invalidate({ pattern });
  }

  /**
   * Executes a batch array of ICacheInvalidation specifications.
   *
   * @param invalidations Array of invalidation target specifications.
   */
  async invalidateBatch(invalidations: ICacheInvalidation[]): Promise<number> {
    if (!invalidations || invalidations.length === 0) return 0;
    let totalCount = 0;

    for (const inv of invalidations) {
      const count = await this.cacheService.invalidate(inv);
      totalCount += count;
    }

    return totalCount;
  }
}
