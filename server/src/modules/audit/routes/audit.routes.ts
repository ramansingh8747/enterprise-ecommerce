import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize, ROLES } from '../../../middleware/role.middleware';
import { auditController } from '../../../container';
import {
  getAuditLogsValidation,
  getAuditLogByIdValidation,
  exportAuditLogsValidation,
  cleanupAuditLogsValidation,
} from '../validators/audit.validator';

/**
 * Audit Log Module REST Router (Module 24.5).
 *
 * Thin route-wiring layer exposing Audit endpoints.
 * All endpoints require JWT authentication and ADMIN / SUPER_ADMIN authorization.
 *
 * Mounted at: /api/v1/audit-logs
 */
const auditRouter = Router();

/**
 * GET /api/v1/audit-logs
 * Paginated query for audit logs with filtering and sorting.
 */
auditRouter.get(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...getAuditLogsValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    auditController.getAuditLogs(req, res, next);
  }
);

/**
 * GET /api/v1/audit-logs/statistics
 * Analytical statistical aggregation summary of audit activity.
 */
auditRouter.get(
  '/statistics',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  (req: Request, res: Response, next: NextFunction): void => {
    auditController.getStatistics(req, res, next);
  }
);

/**
 * GET /api/v1/audit-logs/:id
 * Single audit log retrieval by ID.
 */
auditRouter.get(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...getAuditLogByIdValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    auditController.getAuditLogById(req, res, next);
  }
);

/**
 * POST /api/v1/audit-logs/export
 * Prepares audit log export payload in JSON or CSV format.
 */
auditRouter.post(
  '/export',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...exportAuditLogsValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    auditController.exportAuditLogs(req, res, next);
  }
);

/**
 * DELETE /api/v1/audit-logs/cleanup
 * Purges old audit log records older than retention window.
 */
auditRouter.delete(
  '/cleanup',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...cleanupAuditLogsValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    auditController.cleanupAuditLogs(req, res, next);
  }
);

export default auditRouter;
