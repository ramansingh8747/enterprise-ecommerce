import { Request, Response, NextFunction } from 'express';
import { INotificationService } from '../interfaces/notification-service.interface';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { INotification } from '../interfaces/notification.interface';
import {
  INotificationQueryFilter,
  INotificationQueryResult,
} from '../interfaces/notification-repository.interface';
import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '../types/notification.types';

/**
 * Enterprise Notification Controller (Module 19.5).
 * 
 * Thin HTTP adapter for Notification management REST endpoints.
 * Responsibilities (SRP):
 * 1. Read authenticated userId from JWT context (req.user).
 * 2. Parse request query/param/body parameters.
 * 3. Delegate execution strictly to INotificationService interface.
 * 4. Return standardized ApiResponse envelopes.
 * 5. Pass unhandled errors to Express next(error) middleware.
 * 6. Zero business logic inside controller handlers.
 */
export class NotificationController {
  constructor(private readonly notificationService: INotificationService) {}

  /**
   * Reads authenticated userId from JWT context.
   */
  private getAuthenticatedUserId(req: Request): string | null {
    return (req as any).user?._id?.toString() || (req as any).user?.id?.toString() || null;
  }

  /**
   * POST /api/v1/notifications
   * Creates a single notification record.
   */
  async createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification: INotification = await this.notificationService.createNotification(req.body);

      const response: ApiResponse<INotification> = {
        success: true,
        message: 'Notification created successfully.',
        data: notification,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/notifications/bulk
   * Creates multiple notification records in bulk.
   */
  async createBulkNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = req.body.items || [];
      const notifications: INotification[] = await this.notificationService.createBulkNotifications(items);

      const response: ApiResponse<INotification[]> = {
        success: true,
        message: 'Bulk notifications created successfully.',
        data: notifications,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/notifications/schedule
   * Schedules a notification for future dispatch execution.
   */
  async scheduleNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { scheduledAt, ...data } = req.body;
      const scheduledDate = new Date(scheduledAt);

      const notification: INotification = await this.notificationService.scheduleNotification(
        data,
        scheduledDate
      );

      const response: ApiResponse<INotification> = {
        success: true,
        message: 'Notification scheduled successfully.',
        data: notification,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/notifications/:id
   * Retrieves a single notification record by ID.
   */
  async getNotificationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const notification = await this.notificationService.getNotificationById(id);

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }

      const response: ApiResponse<INotification> = {
        success: true,
        message: 'Notification retrieved successfully.',
        data: notification,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/notifications/me
   * Retrieves paginated notifications for the authenticated user.
   */
  async getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getAuthenticatedUserId(req);
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const filter: INotificationQueryFilter = {
        page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
        limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
        type: req.query.type ? (String(req.query.type) as NotificationType) : undefined,
        channel: req.query.channel ? (String(req.query.channel) as NotificationChannel) : undefined,
        status: req.query.status ? (String(req.query.status) as NotificationStatus) : undefined,
        priority: req.query.priority ? (String(req.query.priority) as NotificationPriority) : undefined,
        isRead: req.query.isRead !== undefined ? String(req.query.isRead) === 'true' : undefined,
        sortBy: req.query.sortBy ? String(req.query.sortBy) : undefined,
        sortOrder: req.query.sortOrder === 'asc' ? 'asc' : 'desc',
      };

      const result: INotificationQueryResult = await this.notificationService.getUserNotifications(
        userId,
        filter
      );

      const response: ApiResponse<INotificationQueryResult> = {
        success: true,
        message: 'User notifications retrieved successfully.',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/notifications/me/unread
   * Retrieves paginated unread notifications for the authenticated user.
   */
  async getUnreadUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getAuthenticatedUserId(req);
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const filter: INotificationQueryFilter = {
        page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
        limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
        sortBy: req.query.sortBy ? String(req.query.sortBy) : undefined,
        sortOrder: req.query.sortOrder === 'asc' ? 'asc' : 'desc',
      };

      const result: INotificationQueryResult = await this.notificationService.getUnreadUserNotifications(
        userId,
        filter
      );

      const response: ApiResponse<INotificationQueryResult> = {
        success: true,
        message: 'Unread user notifications retrieved successfully.',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/notifications/me/unread/count
   * Retrieves total count of unread notifications for the authenticated user.
   */
  async countUnreadNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getAuthenticatedUserId(req);
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const unreadCount = await this.notificationService.countUnreadNotifications(userId);

      const response: ApiResponse<{ unreadCount: number }> = {
        success: true,
        message: 'Unread notification count retrieved successfully.',
        data: { unreadCount },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   * Marks a single notification as read.
   */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getAuthenticatedUserId(req);
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const id = String(req.params.id);
      const notification = await this.notificationService.markAsRead(userId, id);

      const response: ApiResponse<INotification> = {
        success: true,
        message: 'Notification marked as read.',
        data: notification,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/notifications/me/read-all
   * Marks all unread notifications (or target array of IDs) as read.
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getAuthenticatedUserId(req);
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const { notificationIds } = req.body;
      const modifiedCount = await this.notificationService.markAllAsRead(userId, notificationIds);

      const response: ApiResponse<{ modifiedCount: number }> = {
        success: true,
        message: 'Notifications marked as read.',
        data: { modifiedCount },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/notifications/:id/status
   * Updates notification status enforcing state machine rules.
   */
  async updateNotificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { status, failureReason } = req.body;

      const notification = await this.notificationService.updateNotificationStatus(
        id,
        status,
        failureReason
      );

      const response: ApiResponse<INotification> = {
        success: true,
        message: 'Notification status updated successfully.',
        data: notification,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/notifications/:id/retry
   * Retries a failed notification (state management only).
   */
  async retryNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const notification = await this.notificationService.retryNotification(id);

      const response: ApiResponse<INotification> = {
        success: true,
        message: 'Notification retried successfully.',
        data: notification,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/notifications/:id/cancel
   * Cancels a pending or queued notification.
   */
  async cancelNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const notification = await this.notificationService.cancelNotification(id);

      const response: ApiResponse<INotification> = {
        success: true,
        message: 'Notification cancelled successfully.',
        data: notification,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/notifications/:id
   * Hard deletes a notification record.
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await this.notificationService.deleteNotification(id);

      const response: ApiResponse = {
        success: true,
        message: 'Notification deleted successfully.',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
