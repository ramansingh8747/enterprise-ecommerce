import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize, ROLES } from '../../../middleware/role.middleware';
import { notificationController } from '../../../container';
import {
  createNotificationValidation,
  createBulkNotificationsValidation,
  scheduleNotificationValidation,
  getNotificationByIdValidation,
  getUserNotificationsValidation,
  markAsReadValidation,
  markAllAsReadValidation,
  updateNotificationStatusValidation,
  retryNotificationValidation,
  cancelNotificationValidation,
  deleteNotificationValidation,
} from '../validations/notification.validation';

const notificationRouter = Router();

/* ==========================================================================
   AUTHENTICATED CUSTOMER / SYSTEM NOTIFICATION ENDPOINTS
   ========================================================================== */

/**
 * GET /api/v1/notifications/me
 * Retrieves paginated notifications for the authenticated user.
 */
notificationRouter.get(
  '/me',
  authenticate,
  getUserNotificationsValidation,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.getUserNotifications(req, res, next)
);

/**
 * GET /api/v1/notifications/me/unread
 * Retrieves paginated unread notifications for the authenticated user.
 */
notificationRouter.get(
  '/me/unread',
  authenticate,
  getUserNotificationsValidation,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.getUnreadUserNotifications(req, res, next)
);

/**
 * GET /api/v1/notifications/me/unread/count
 * Retrieves total unread notification count for the authenticated user.
 */
notificationRouter.get(
  '/me/unread/count',
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.countUnreadNotifications(req, res, next)
);

/**
 * PATCH /api/v1/notifications/me/read-all
 * Marks all unread notifications (or target list of IDs) as read.
 */
notificationRouter.patch(
  '/me/read-all',
  authenticate,
  markAllAsReadValidation,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.markAllAsRead(req, res, next)
);

/**
 * POST /api/v1/notifications
 * Creates a single notification record.
 */
notificationRouter.post(
  '/',
  authenticate,
  createNotificationValidation,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.createNotification(req, res, next)
);

/**
 * POST /api/v1/notifications/bulk
 * Creates multiple notification records in bulk.
 */
notificationRouter.post(
  '/bulk',
  authenticate,
  createBulkNotificationsValidation,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.createBulkNotifications(req, res, next)
);

/**
 * POST /api/v1/notifications/schedule
 * Schedules a notification for future dispatch execution.
 */
notificationRouter.post(
  '/schedule',
  authenticate,
  scheduleNotificationValidation,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.scheduleNotification(req, res, next)
);

/**
 * GET /api/v1/notifications/:id
 * Retrieves a single notification record by ID.
 */
notificationRouter.get(
  '/:id',
  authenticate,
  getNotificationByIdValidation,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.getNotificationById(req, res, next)
);

/**
 * PATCH /api/v1/notifications/:id/read
 * Marks a single notification as read.
 */
notificationRouter.patch(
  '/:id/read',
  authenticate,
  markAsReadValidation,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.markAsRead(req, res, next)
);

/**
 * POST /api/v1/notifications/:id/cancel
 * Cancels a pending or queued notification.
 */
notificationRouter.post(
  '/:id/cancel',
  authenticate,
  cancelNotificationValidation,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.cancelNotification(req, res, next)
);

/**
 * DELETE /api/v1/notifications/:id
 * Hard deletes a notification record.
 */
notificationRouter.delete(
  '/:id',
  authenticate,
  deleteNotificationValidation,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.deleteNotification(req, res, next)
);

/* ==========================================================================
   ADMINISTRATOR NOTIFICATION MANAGEMENT ENDPOINTS (JWT + RBAC Required)
   ========================================================================== */

/**
 * PATCH /api/v1/notifications/:id/status
 * Updates notification status enforcing state machine rules (Admin action).
 */
notificationRouter.patch(
  '/:id/status',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  updateNotificationStatusValidation,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.updateNotificationStatus(req, res, next)
);

/**
 * POST /api/v1/notifications/:id/retry
 * Retries a failed notification (Admin action).
 */
notificationRouter.post(
  '/:id/retry',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  retryNotificationValidation,
  (req: Request, res: Response, next: NextFunction) =>
    notificationController.retryNotification(req, res, next)
);

export default notificationRouter;
