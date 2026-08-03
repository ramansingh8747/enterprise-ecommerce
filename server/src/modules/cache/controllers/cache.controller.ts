import { Request, Response, NextFunction } from 'express';
import { ICacheService, ICacheStatistics } from '../interfaces/cache.interfaces';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { CacheStatus } from '../enums/cache.enums';
import { CacheInvalidator } from '../invalidation/cache-invalidator';

/**
 * Enterprise Cache Controller (Module 26.5).
 *
 * Thin HTTP controller exposing administrative REST API endpoints for the Cache module.
 * Responsibilities:
 * 1. Read validated request parameters/body/query parameters.
 * 2. Delegate execution strictly to ICacheService and CacheInvalidator.
 * 3. Return standardized ApiResponse envelopes.
 * 4. Forward errors to Express next(error) middleware.
 *
 * Contains ZERO business logic.
 */
export class CacheController {
  private readonly cacheInvalidator: CacheInvalidator;

  constructor(private readonly cacheService: ICacheService) {
    this.cacheInvalidator = new CacheInvalidator(cacheService);
  }

  /**
   * GET /api/v1/cache
   * Retrieves a cached entry by key.
   */
  async getCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = String(req.query.key);
      const namespace = req.query.namespace ? String(req.query.namespace) : undefined;

      const { value, status } = await this.cacheService.get(key, undefined, { namespace });

      if (status === CacheStatus.MISS || value === null) {
        res.status(404).json({
          success: false,
          message: `Cache entry not found or expired for key: '${key}'.`,
        });
        return;
      }

      const response: ApiResponse<{ key: string; status: CacheStatus; value: unknown }> = {
        success: true,
        message: 'Cache entry retrieved successfully.',
        data: { key, status, value },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/cache
   * Stores a payload entry in the cache store.
   */
  async setCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key, value, ttl, namespace, metadata } = req.body;

      const success = await this.cacheService.set(key, value, {
        ttl,
        namespace,
        tags: metadata?.tags,
      });

      if (!success) {
        res.status(400).json({
          success: false,
          message: `Failed to store cache entry for key '${key}'. Payload may exceed size limits.`,
        });
        return;
      }

      const response: ApiResponse<{ key: string; stored: boolean }> = {
        success: true,
        message: 'Cache entry stored successfully.',
        data: { key, stored: true },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/cache
   * Removes a single cache entry by key.
   */
  async deleteCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = String(req.query.key);
      const deleted = await this.cacheService.delete(key);

      const response: ApiResponse<{ key: string; deleted: boolean }> = {
        success: true,
        message: deleted ? 'Cache entry deleted successfully.' : 'Cache key not found.',
        data: { key, deleted },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/cache/invalidate
   * Invalidates targeted cache entries by key, namespace, or entity rules.
   */
  async invalidateCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { keys, namespaces, entity, entityId } = req.body;
      let count = 0;

      if (entity) {
        count += await this.cacheInvalidator.invalidateEntity(entity, entityId);
      }

      if (keys && Array.isArray(keys)) {
        count += await this.cacheService.deleteMany(keys);
      }

      if (namespaces && Array.isArray(namespaces)) {
        for (const ns of namespaces) {
          const ok = await this.cacheService.clear(ns);
          if (ok) count += 1;
        }
      }

      const response: ApiResponse<{ invalidatedCount: number }> = {
        success: true,
        message: 'Cache invalidation request completed.',
        data: { invalidatedCount: count },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/cache/warmup
   * Pre-loads cache entries in bulk.
   */
  async warmupCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { namespace, entries } = req.body;

      const bulkEntries = entries.map((e: { key: string; value: unknown; ttl?: number }) => ({
        key: e.key,
        value: e.value,
        options: { ttl: e.ttl, namespace },
      }));

      const ok = await this.cacheService.setMany(bulkEntries);

      const response: ApiResponse<{ totalEntries: number; success: boolean }> = {
        success: true,
        message: 'Cache warmup completed successfully.',
        data: { totalEntries: entries.length, success: ok },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/cache/statistics
   * Returns analytical statistics and performance metrics for the cache.
   */
  async getStatistics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats: ICacheStatistics = await this.cacheService.statistics();

      const response: ApiResponse<ICacheStatistics> = {
        success: true,
        message: 'Cache statistics retrieved successfully.',
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/cache/clear
   * Clears all entries from the cache or a target namespace.
   */
  async clearCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const namespace = req.body?.namespace || req.query?.namespace
        ? String(req.body?.namespace || req.query?.namespace)
        : undefined;

      const cleared = await this.cacheService.clear(namespace);

      const response: ApiResponse<{ namespace?: string; cleared: boolean }> = {
        success: true,
        message: namespace
          ? `Cache namespace '${namespace}' cleared successfully.`
          : 'Entire cache store cleared successfully.',
        data: { namespace, cleared },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
