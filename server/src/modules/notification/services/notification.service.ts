import { Types } from 'mongoose';
import { INotificationRepository } from '../interfaces/notification-repository.interface';
import { INotificationService } from '../interfaces/notification-service.interface';
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
import { NotificationPayload } from '../interfaces/notification-payload.interface';
import { NotificationResult } from '../interfaces/notification-result.interface';
import { SendNotificationRequest, SendNotificationResponse } from '../dto/notification.dto';

/**
 * Enterprise Notification Service Implementation (Module 19.4).
 * 
 * Encapsulates all business rules, input validations, state machine transitions,
 * retry policies, and user inbox mark-as-read orchestration.
 * Strict Clean Architecture: Transport-independent and vendor-decoupled.
 */
export class NotificationService implements INotificationService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  /**
   * Validates state machine lifecycle transitions.
   */
  private validateStatusTransition(
    currentStatus: NotificationStatus,
    newStatus: NotificationStatus
  ): void {
    if (currentStatus === newStatus) {
      return;
    }

    const allowedTransitions: Record<NotificationStatus, NotificationStatus[]> = {
      [NotificationStatus.PENDING]: [
        NotificationStatus.PROCESSING,
        NotificationStatus.CANCELLED,
        NotificationStatus.FAILED,
        NotificationStatus.QUEUED,
      ],
      [NotificationStatus.QUEUED]: [
        NotificationStatus.PROCESSING,
        NotificationStatus.CANCELLED,
        NotificationStatus.FAILED,
      ],
      [NotificationStatus.PROCESSING]: [
        NotificationStatus.SENT,
        NotificationStatus.FAILED,
      ],
      [NotificationStatus.FAILED]: [
        NotificationStatus.RETRYING,
        NotificationStatus.CANCELLED,
        NotificationStatus.PENDING,
      ],
      [NotificationStatus.RETRYING]: [
        NotificationStatus.PROCESSING,
        NotificationStatus.FAILED,
        NotificationStatus.CANCELLED,
      ],
      [NotificationStatus.SENT]: [], // Terminal state
      [NotificationStatus.CANCELLED]: [], // Terminal state
    };

    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Invalid notification status transition from '${currentStatus}' to '${newStatus}'`
      );
    }
  }

  /**
   * Validates raw input notification properties prior to persistence.
   */
  private validateNotificationInput(data: Partial<INotification>): void {
    if (!data.type || !Object.values(NotificationType).includes(data.type)) {
      throw new Error(`Invalid or missing notification type: ${data.type}`);
    }

    if (!data.channel || !Object.values(NotificationChannel).includes(data.channel)) {
      throw new Error(`Invalid or missing notification channel: ${data.channel}`);
    }

    if (data.priority && !Object.values(NotificationPriority).includes(data.priority)) {
      throw new Error(`Invalid notification priority: ${data.priority}`);
    }

    const message = data.message || data.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Notification message content is required');
    }

    if (!data.recipient || typeof data.recipient !== 'object') {
      throw new Error('Notification recipient details are required');
    }

    const { userId, email, phone, deviceToken, webhookUrl } = data.recipient;
    if (!userId && !email && !phone && !deviceToken && !webhookUrl) {
      throw new Error('Notification recipient must specify at least one valid destination endpoint');
    }
  }

  /**
   * Creates a single notification record after applying business validations.
   */
  async createNotification(data: Partial<INotification>): Promise<INotification> {
    this.validateNotificationInput(data);

    let initialStatus = data.status || NotificationStatus.PENDING;

    if (data.scheduledAt) {
      const scheduledDate = new Date(data.scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        throw new Error('Invalid scheduledAt timestamp');
      }
      if (scheduledDate.getTime() < Date.now()) {
        throw new Error('Scheduled notification date cannot be in the past');
      }
      initialStatus = NotificationStatus.QUEUED;
    }

    const payload: Partial<INotification> = {
      ...data,
      status: initialStatus,
      priority: data.priority || NotificationPriority.NORMAL,
      message: data.message || data.body || '',
      title: data.title || data.subject,
      retryCount: data.retryCount || 0,
      maxRetries: data.maxRetries ?? 3,
      isRead: false,
    };

    return this.notificationRepository.create(payload);
  }

  /**
   * Creates multiple notification records in bulk.
   */
  async createBulkNotifications(items: Partial<INotification>[]): Promise<INotification[]> {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const results: INotification[] = [];
    for (const item of items) {
      const created = await this.createNotification(item);
      results.push(created);
    }
    return results;
  }

  /**
   * Schedules a notification for future dispatch execution.
   */
  async scheduleNotification(
    data: Partial<INotification>,
    scheduledAt: Date
  ): Promise<INotification> {
    return this.createNotification({
      ...data,
      scheduledAt,
    });
  }

  /**
   * Fetches a notification record by ID.
   */
  async getNotificationById(id: string): Promise<INotification | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid notification ID format: ${id}`);
    }
    return this.notificationRepository.findById(id);
  }

  /**
   * Retrieves paginated notifications for a specific user.
   */
  async getUserNotifications(
    userId: string,
    filter?: INotificationQueryFilter
  ): Promise<INotificationQueryResult> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid user ID format: ${userId}`);
    }
    return this.notificationRepository.findByUser(userId, filter);
  }

  /**
   * Retrieves paginated unread notifications for a specific user.
   */
  async getUnreadUserNotifications(
    userId: string,
    filter?: INotificationQueryFilter
  ): Promise<INotificationQueryResult> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid user ID format: ${userId}`);
    }
    return this.notificationRepository.findUnreadByUser(userId, filter);
  }

  /**
   * Counts total unread notifications for a user.
   */
  async countUnreadNotifications(userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid user ID format: ${userId}`);
    }
    return this.notificationRepository.countUnread(userId);
  }

  /**
   * Marks a single notification as read after validating user ownership.
   */
  async markAsRead(userId: string, notificationId: string): Promise<INotification> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(notificationId)) {
      throw new Error('Invalid userId or notificationId format');
    }

    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId && notification.userId.toString() !== userId) {
      throw new Error('Unauthorized: Notification does not belong to requesting user');
    }

    const updated = await this.notificationRepository.markAsRead(notificationId);
    if (!updated) {
      throw new Error('Failed to mark notification as read');
    }

    return updated;
  }

  /**
   * Marks all unread notifications (or target list of notification IDs) as read for a user.
   */
  async markAllAsRead(userId: string, notificationIds?: string[]): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid user ID format: ${userId}`);
    }

    if (notificationIds && notificationIds.length > 0) {
      return this.notificationRepository.markMultipleAsRead(notificationIds);
    }

    const unreadResult = await this.notificationRepository.findUnreadByUser(userId, {
      page: 1,
      limit: 1000,
    });

    const idsToMark = unreadResult.items
      .map((item) => (item._id ? item._id.toString() : null))
      .filter((id): id is string => Boolean(id));

    if (idsToMark.length === 0) {
      return 0;
    }

    return this.notificationRepository.markMultipleAsRead(idsToMark);
  }

  /**
   * Updates notification status enforcing valid state machine transitions.
   */
  async updateNotificationStatus(
    id: string,
    newStatus: NotificationStatus,
    failureReason?: string
  ): Promise<INotification> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid notification ID format: ${id}`);
    }

    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }

    this.validateStatusTransition(notification.status, newStatus);

    const updated = await this.notificationRepository.updateStatus(id, newStatus, failureReason);
    if (!updated) {
      throw new Error('Failed to update notification status');
    }

    return updated;
  }

  /**
   * Retries a failed notification (state management only, no delivery).
   */
  async retryNotification(id: string): Promise<INotification> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid notification ID format: ${id}`);
    }

    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (
      notification.status !== NotificationStatus.FAILED &&
      notification.status !== NotificationStatus.RETRYING
    ) {
      throw new Error(`Cannot retry notification with status '${notification.status}'`);
    }

    if (notification.retryCount >= notification.maxRetries) {
      throw new Error(
        `Maximum retry limit (${notification.maxRetries}) reached for notification ${id}`
      );
    }

    const updated = await this.notificationRepository.incrementRetryCount(
      id,
      'Manual or automated retry initiated'
    );

    if (!updated) {
      throw new Error('Failed to increment notification retry count');
    }

    return updated;
  }

  /**
   * Cancels a pending or queued notification.
   */
  async cancelNotification(id: string): Promise<INotification> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid notification ID format: ${id}`);
    }

    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (
      notification.status !== NotificationStatus.PENDING &&
      notification.status !== NotificationStatus.QUEUED
    ) {
      throw new Error(`Cannot cancel notification with status '${notification.status}'`);
    }

    const updated = await this.notificationRepository.updateStatus(
      id,
      NotificationStatus.CANCELLED,
      'Cancelled by user or administrator'
    );

    if (!updated) {
      throw new Error('Failed to cancel notification');
    }

    return updated;
  }

  /**
   * Hard-deletes a notification record.
   */
  async deleteNotification(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid notification ID format: ${id}`);
    }
    return this.notificationRepository.delete(id);
  }

  /* ==========================================================================
     BACKWARD COMPATIBILITY PLACEHOLDERS
     ========================================================================== */

  async send(
    _payload: NotificationPayload | SendNotificationRequest
  ): Promise<NotificationResult | SendNotificationResponse> {
    throw new Error('NotificationService.send is a provider dispatcher; delivery runs in provider step');
  }
}
