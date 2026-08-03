import { CacheNamespace } from '../enums/cache.enums';
import { ICacheInvalidation } from '../interfaces/cache.interfaces';

/**
 * Enterprise Cache Invalidation Rules Manager (Module 26.4).
 *
 * Configurable rule engine mapping domain entity mutations (Product, Category, Order, etc.)
 * to targeted namespace and tag invalidation specifications.
 */
export class InvalidationRulesManager {
  /**
   * Rule matrix mapping domain entities to affected target namespaces.
   */
  private static readonly RULE_MATRIX: Record<string, CacheNamespace[]> = {
    PRODUCT: [CacheNamespace.PRODUCT, CacheNamespace.SEARCH, CacheNamespace.ANALYTICS],
    CATEGORY: [CacheNamespace.CATEGORY, CacheNamespace.PRODUCT, CacheNamespace.SEARCH],
    BRAND: [CacheNamespace.BRAND, CacheNamespace.PRODUCT, CacheNamespace.SEARCH],
    INVENTORY: [CacheNamespace.INVENTORY, CacheNamespace.PRODUCT, CacheNamespace.SEARCH],
    ORDER: [CacheNamespace.ORDER, CacheNamespace.INVENTORY, CacheNamespace.ANALYTICS],
    USER: [CacheNamespace.USER, CacheNamespace.SESSION],
    SESSION: [CacheNamespace.SESSION],
    SETTINGS: [CacheNamespace.SETTINGS],
  };

  /**
   * Resolves invalidation target specifications for a given domain entity action.
   *
   * @param entity Name of domain entity mutated (e.g. 'PRODUCT', 'ORDER').
   * @param entityId Optional ID of specific entity instance.
   * @returns Array of ICacheInvalidation target specifications.
   */
  static resolveInvalidationTargets(entity: string, entityId?: string): ICacheInvalidation[] {
    const normEntity = String(entity).toUpperCase().trim();
    const namespaces = InvalidationRulesManager.RULE_MATRIX[normEntity] || [CacheNamespace.SETTINGS];

    const invalidations: ICacheInvalidation[] = namespaces.map((ns) => ({
      namespace: ns,
    }));

    if (entityId) {
      invalidations.push({
        tags: [`${normEntity}:${entityId}`],
      });
    }

    return invalidations;
  }
}
