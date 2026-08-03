import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize, ROLES } from '../../../middleware/role.middleware';
import { jobsController } from '../../../container';
import {
  createJobValidation,
  getJobsValidation,
  jobIdParamValidation,
  retryJobValidation,
  cancelJobValidation,
  cleanupJobsValidation,
} from '../validators/jobs.validator';

/**
 * Background Jobs Engine REST Router (Module 25.5).
 *
 * Thin route-wiring layer exposing Background Jobs endpoints.
 * All endpoints require JWT authentication and ADMIN / SUPER_ADMIN authorization.
 *
 * Mounted at: /api/v1/jobs
 */
const jobsRouter = Router();

/**
 * POST /api/v1/jobs
 * Creates and enqueues a new background job.
 */
jobsRouter.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...createJobValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    jobsController.createJob(req, res, next);
  }
);

/**
 * GET /api/v1/jobs
 * Returns paginated background jobs matching query filters.
 */
jobsRouter.get(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...getJobsValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    jobsController.getJobs(req, res, next);
  }
);

/**
 * GET /api/v1/jobs/statistics
 * Returns job execution metrics and statistical breakdowns.
 */
jobsRouter.get(
  '/statistics',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  (req: Request, res: Response, next: NextFunction): void => {
    jobsController.getStatistics(req, res, next);
  }
);

/**
 * GET /api/v1/jobs/:id
 * Retrieves a single job by ID.
 */
jobsRouter.get(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...jobIdParamValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    jobsController.getJobById(req, res, next);
  }
);

/**
 * POST /api/v1/jobs/:id/retry
 * Retries a failed or cancelled background job.
 */
jobsRouter.post(
  '/:id/retry',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...retryJobValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    jobsController.retryJob(req, res, next);
  }
);

/**
 * POST /api/v1/jobs/:id/cancel
 * Cancels a pending or queued background job.
 */
jobsRouter.post(
  '/:id/cancel',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...cancelJobValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    jobsController.cancelJob(req, res, next);
  }
);

/**
 * DELETE /api/v1/jobs/cleanup
 * Purges finished jobs older than retention window.
 */
jobsRouter.delete(
  '/cleanup',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...cleanupJobsValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    jobsController.cleanupJobs(req, res, next);
  }
);

export default jobsRouter;
