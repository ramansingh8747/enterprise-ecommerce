import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize, ROLES } from '../../../middleware/role.middleware';
import { cacheController } from '../../../container';
import {
  getCacheValidation,
  setCacheValidation,
  deleteCacheValidation,
  invalidateCacheValidation,
  warmupCacheValidation,
  clearCacheValidation,
} from '../validators/cache.validator';

/**
 * Enterprise Cache Engine REST Router (Module 26.5).
 *
 * Thin route-wiring layer exposing Cache management endpoints.
 * All endpoints require JWT authentication and ADMIN / SUPER_ADMIN authorization.
 *
 * Mounted at: /api/v1/cache
 */
const cacheRouter = Router();

/**
 * GET /api/v1/cache
 * Retrieves a cached entry by key.
 */
cacheRouter.get(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...getCacheValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    cacheController.getCache(req, res, next);
  }
);

/**
 * POST /api/v1/cache
 * Stores a payload entry in the cache.
 */
cacheRouter.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...setCacheValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    cacheController.setCache(req, res, next);
  }
);

/**
 * DELETE /api/v1/cache
 * Removes a single entry from the cache.
 */
cacheRouter.delete(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...deleteCacheValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    cacheController.deleteCache(req, res, next);
  }
);

/**
 * POST /api/v1/cache/invalidate
 * Invalidates targeted cache keys, namespaces, or entity rules.
 */
cacheRouter.post(
  '/invalidate',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...invalidateCacheValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    cacheController.invalidateCache(req, res, next);
  }
);

/**
 * POST /api/v1/cache/warmup
 * Pre-loads cache entries in bulk.
 */
cacheRouter.post(
  '/warmup',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...warmupCacheValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    cacheController.warmupCache(req, res, next);
  }
);

/**
 * GET /api/v1/cache/statistics
 * Returns operational metrics and hit/miss performance statistics.
 */
cacheRouter.get(
  '/statistics',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  (req: Request, res: Response, next: NextFunction): void => {
    cacheController.getStatistics(req, res, next);
  }
);

/**
 * DELETE /api/v1/cache/clear
 * Purges all entries from the cache or a specific namespace.
 */
cacheRouter.delete(
  '/clear',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...clearCacheValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    cacheController.clearCache(req, res, next);
  }
);

export default cacheRouter;
