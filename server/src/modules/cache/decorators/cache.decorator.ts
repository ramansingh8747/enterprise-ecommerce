import { Request } from 'express';
import { CacheNamespace } from '../enums/cache.enums';
import { ICacheOptions } from '../interfaces/cache.interfaces';
import { CacheKeyUtil } from '../utils/cache-key.util';
import { DEFAULT_TTL } from '../constants/cache.constants';

/**
 * Enterprise Cache Decorator & Helper Utility (Module 26.4).
 *
 * Provides helper functions for checking HTTP request cache eligibility,
 * generating namespaced cache keys, resolving custom TTLs, and constructing metadata.
 */
export class CacheDecoratorUtil {
  /**
   * Determines whether an incoming HTTP request is eligible for response caching.
   *
   * Rules:
   * 1. Method must be GET.
   * 2. Cache-Control header must not contain 'no-store' or 'no-cache'.
   * 3. Excluded paths (e.g. /health, /auth) return false.
   *
   * @param req Express Request object.
   */
  static shouldCache(req: Request, _options?: Partial<ICacheOptions>): boolean {
    if (req.method.toUpperCase() !== 'GET') return false;

    const cacheControl = req.headers['cache-control'];
    if (cacheControl && (cacheControl.includes('no-store') || cacheControl.includes('no-cache'))) {
      return false;
    }

    const path = (req.originalUrl || req.url).toLowerCase();
    if (path.includes('/auth') || path.includes('/health') || path.includes('/metrics')) {
      return false;
    }

    return true;
  }

  /**
   * Resolves the appropriate CacheNamespace enum based on route path.
   *
   * @param req Express Request object.
   */
  static resolveNamespace(req: Request): CacheNamespace {
    const path = (req.originalUrl || req.url).toLowerCase();

    if (path.includes('/products') || path.includes('/product')) return CacheNamespace.PRODUCT;
    if (path.includes('/categories') || path.includes('/category')) return CacheNamespace.CATEGORY;
    if (path.includes('/brands') || path.includes('/brand')) return CacheNamespace.BRAND;
    if (path.includes('/inventory')) return CacheNamespace.INVENTORY;
    if (path.includes('/orders')) return CacheNamespace.ORDER;
    if (path.includes('/users')) return CacheNamespace.USER;
    if (path.includes('/search')) return CacheNamespace.SEARCH;
    if (path.includes('/analytics')) return CacheNamespace.ANALYTICS;

    return CacheNamespace.SETTINGS;
  }

  /**
   * Generates a deterministic namespaced cache key from an Express Request.
   *
   * Format: prefix:namespace:method:url
   *
   * @param req Express Request object.
   * @param customNamespace Optional namespace override.
   */
  static buildCacheKey(req: Request, customNamespace?: string): string {
    const namespace = customNamespace || CacheDecoratorUtil.resolveNamespace(req);
    const url = req.originalUrl || req.url;
    return CacheKeyUtil.buildKey(namespace, `${req.method.toUpperCase()}:${url}`);
  }

  /**
   * Resolves time-to-live seconds from custom options or defaults.
   *
   * @param _req Express Request object.
   * @param customTTL Optional custom TTL in seconds.
   */
  static resolveTTL(_req: Request, customTTL?: number): number {
    if (customTTL && customTTL > 0) return customTTL;
    return DEFAULT_TTL;
  }

  /**
   * Constructs structured cache metadata for an HTTP request.
   *
   * @param req Express Request object.
   * @param durationMs Execution duration in milliseconds.
   */
  static buildCacheMetadata(req: Request, durationMs: number): Record<string, unknown> {
    return {
      method: req.method,
      url: req.originalUrl || req.url,
      durationMs,
      cachedAt: new Date().toISOString(),
    };
  }
}
