import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize, ROLES } from '../../../middleware/role.middleware';
import { rateLimitController } from '../../../container';
import {
  getRateLimitValidation,
  resetValidation,
  resetManyValidation,
  whitelistValidation,
  removeWhitelistValidation,
  blacklistValidation,
  removeBlacklistValidation,
} from '../validators/rate-limit.validator';

/**
 * Enterprise Rate Limit Administration REST Router (Module 28.5).
 *
 * All endpoints require JWT authentication and ADMIN / SUPER_ADMIN role authorization.
 * Mounted at: /api/v1/rate-limit
 */
const rateLimitRouter = Router();

/**
 * GET /api/v1/rate-limit
 * Evaluates rate limit status for an identifier.
 */
rateLimitRouter.get(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...getRateLimitValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    rateLimitController.getRateLimit(req, res, next);
  }
);

/**
 * GET /api/v1/rate-limit/statistics
 * Computes aggregate system operational statistics.
 */
rateLimitRouter.get(
  '/statistics',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  (req: Request, res: Response, next: NextFunction): void => {
    rateLimitController.getStatistics(req, res, next);
  }
);

/**
 * POST /api/v1/rate-limit/reset
 * Resets quota for a single identifier.
 */
rateLimitRouter.post(
  '/reset',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...resetValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    rateLimitController.reset(req, res, next);
  }
);

/**
 * POST /api/v1/rate-limit/reset-many
 * Batch resets quotas for multiple identifiers.
 */
rateLimitRouter.post(
  '/reset-many',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...resetManyValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    rateLimitController.resetMany(req, res, next);
  }
);

/**
 * POST /api/v1/rate-limit/whitelist
 * Adds identifier to whitelist.
 */
rateLimitRouter.post(
  '/whitelist',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...whitelistValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    rateLimitController.whitelist(req, res, next);
  }
);

/**
 * DELETE /api/v1/rate-limit/whitelist
 * Removes identifier from whitelist.
 */
rateLimitRouter.delete(
  '/whitelist',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...removeWhitelistValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    rateLimitController.removeWhitelist(req, res, next);
  }
);

/**
 * POST /api/v1/rate-limit/blacklist
 * Adds identifier to penalty blacklist.
 */
rateLimitRouter.post(
  '/blacklist',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...blacklistValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    rateLimitController.blacklist(req, res, next);
  }
);

/**
 * DELETE /api/v1/rate-limit/blacklist
 * Removes identifier from penalty blacklist.
 */
rateLimitRouter.delete(
  '/blacklist',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...removeBlacklistValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    rateLimitController.removeBlacklist(req, res, next);
  }
);

export default rateLimitRouter;
