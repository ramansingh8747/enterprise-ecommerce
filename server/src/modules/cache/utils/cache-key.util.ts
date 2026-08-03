import { createHash } from 'crypto';
import { CacheNamespace } from '../enums/cache.enums';
import { CACHE_PREFIX, MAX_CACHE_KEY_LENGTH } from '../constants/cache.constants';

/**
 * Enterprise Cache Key Utility (Module 26.1).
 *
 * Pure utility class responsible for generating, building, normalizing,
 * validating, and hashing cache keys across domain namespaces.
 */
export class CacheKeyUtil {
  /**
   * Builds a standardized, namespaced cache key string.
   *
   * Format: prefix:namespace:identifier (e.g., 'ecommerce:cache:PRODUCT:12345')
   *
   * @param namespace Target domain namespace.
   * @param identifier Unique entity ID or parameter string.
   */
  static buildKey(namespace: CacheNamespace | string, identifier: string | number): string {
    const normNs = String(namespace).trim().toUpperCase();
    const normId = String(identifier).trim();
    const fullKey = `${CACHE_PREFIX}${normNs}:${normId}`;

    return CacheKeyUtil.normalizeKey(fullKey);
  }

  /**
   * Normalizes a namespace identifier string to uppercase.
   *
   * @param domain Target domain name.
   */
  static buildNamespace(domain: string): string {
    return String(domain).trim().toUpperCase();
  }

  /**
   * Normalizes a raw cache key string (trims whitespace, converts backslashes to colons).
   * If key exceeds MAX_CACHE_KEY_LENGTH, automatically hashes the key overflow.
   *
   * @param key Raw cache key input.
   */
  static normalizeKey(key: string): string {
    const trimmed = String(key).trim().replace(/\\/g, ':').replace(/\/+/g, ':');
    if (trimmed.length > MAX_CACHE_KEY_LENGTH) {
      return CacheKeyUtil.hashKey(trimmed);
    }
    return trimmed;
  }

  /**
   * Computes an SHA-256 hash string for long or complex cache keys.
   *
   * @param key Input key or complex string.
   */
  static hashKey(key: string): string {
    const digest = createHash('sha256').update(String(key)).digest('hex').substring(0, 32);
    return `${CACHE_PREFIX}hashed:${digest}`;
  }

  /**
   * Validates whether a cache key string satisfies structural constraints.
   *
   * @param key Target cache key.
   */
  static validateKey(key: string): boolean {
    if (!key || typeof key !== 'string') return false;
    const trimmed = key.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_CACHE_KEY_LENGTH) return false;
    return true;
  }
}
