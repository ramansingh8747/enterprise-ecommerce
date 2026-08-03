import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize, ROLES } from '../../../middleware/role.middleware';
import { apiVersionController } from '../../../container';
import {
  getVersionsValidation,
  validateVersionValidation,
  compatibilityValidation,
  lifecycleValidation,
} from '../validators/api-version.validator';

/**
 * Enterprise API Versioning REST Router (Module 29.5).
 *
 * Exposes API version query and lifecycle management endpoints.
 * Mounted at: /api/v1/api-versions
 */
const apiVersionRouter = Router();

/**
 * GET /api/v1/api-versions
 * Returns active supported API versions.
 */
apiVersionRouter.get(
  '/',
  ...getVersionsValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    apiVersionController.getSupportedVersions(req, res, next);
  }
);

/**
 * GET /api/v1/api-versions/latest
 * Returns current latest active API version.
 */
apiVersionRouter.get(
  '/latest',
  (req: Request, res: Response, next: NextFunction): void => {
    apiVersionController.getLatestVersion(req, res, next);
  }
);

/**
 * GET /api/v1/api-versions/statistics
 * Computes aggregate version operational statistics metrics.
 */
apiVersionRouter.get(
  '/statistics',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  (req: Request, res: Response, next: NextFunction): void => {
    apiVersionController.getStatistics(req, res, next);
  }
);

/**
 * POST /api/v1/api-versions/validate
 * Validates whether a version string is active and supported.
 */
apiVersionRouter.post(
  '/validate',
  ...validateVersionValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    apiVersionController.validateVersion(req, res, next);
  }
);

/**
 * POST /api/v1/api-versions/compatibility
 * Evaluates backward compatibility between source and target versions.
 */
apiVersionRouter.post(
  '/compatibility',
  ...compatibilityValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    apiVersionController.checkCompatibility(req, res, next);
  }
);

/**
 * POST /api/v1/api-versions/lifecycle
 * Performs lifecycle operations (ENABLE, DISABLE, DEPRECATE).
 */
apiVersionRouter.post(
  '/lifecycle',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...lifecycleValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    apiVersionController.handleLifecycle(req, res, next);
  }
);

export default apiVersionRouter;
