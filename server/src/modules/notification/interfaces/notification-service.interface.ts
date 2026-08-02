import { INotification } from './notification.interface';
import {
  INotificationQueryFilter,
  INotificationQueryResult,
} from './notification-repository.interface';
import { NotificationChannel } from '../types/notification.types';
import { NotificationPayload } from './notification-payload.interface';
import { NotificationResult } from './notification-result.interface';
import { INotificationProvider } from './notification-provider.interface';
import { SendNotificationRequest, SendNotificationResponse } from '../dto/notification.dto';

/**
 * Enterprise Notification Service Contract (Module 19.4 Application Boundary).
 */
export interface INotificationService {
  /**
   * Creates a single notification record with business validation.
   */
  createNotification(data: Partial<INotification>): Promise<INotification>;

  /**
   * Creates multiple notification records in bulk.
   */
  createBulkNotifications(items: Partial<INotification>[]): Promise<INotification[]>;

  /**
   * Schedules a notification for future dispatch execution.
   */
  scheduleNotification(data: Partial<INotification>, scheduledAt: Date): Promise<INotification>;

  /**
   * Fetches a notification by ID.
   */
  getNotificationById(id: string): Promise<INotification | null>;

  /**
   * Retrieves paginated notifications for a user.
   */
  getUserNotifications(userId: string, filter?: INotificationQueryFilter): Promise<INotificationQueryResult>;

  /**
   * Retrieves paginated unread notifications for a user.
   */
  getUnreadUserNotifications(userId: string, filter?: INotificationQueryFilter): Promise<INotificationQueryResult>;

  /**
   * Counts unread notifications for a user.
   */
  countUnreadNotifications(userId: string): Promise<number>;

  /**
   * Marks a specific notification as read by user ID and notification ID.
   */
  markAsRead(userId: string, notificationId: string): Promise<INotification>;

  /**
   * Marks all unread notifications (or a target list of IDs) as read for a user.
   */
  markAllAsRead(userId: string, notificationIds?: string[]): Promise<number>;

  /**
   * Transitions notification state enforcing valid lifecycle state machine.
   */
  updateNotificationStatus(
    id: string,
    newStatus: any,
    failureReason?: string
  ): Promise<INotification>;

  /**
   * Retries a failed notification (state management only, no delivery).
   */
  retryNotification(id: string): Promise<INotification>;

  /**
   * Cancels a pending or queued notification.
   */
  cancelNotification(id: string): Promise<INotification>;

  /**
   * Deletes a notification by ID.
   */
  deleteNotification(id: string): Promise<boolean>;

  // Backward compatibility signatures
  send(payload: NotificationPayload | SendNotificationRequest): Promise<NotificationResult | SendNotificationResponse>;
  sendBatch?(payloads: NotificationPayload[]): Promise<NotificationResult[]>;
  registerProvider?(provider: INotificationProvider): void;
  getProvider?(channel: NotificationChannel): INotificationProvider | null;
  sendEmail?(data: SendNotificationRequest): Promise<SendNotificationResponse>;
  sendSMS?(data: SendNotificationRequest): Promise<SendNotificationResponse>;
  sendPush?(data: SendNotificationRequest): Promise<SendNotificationResponse>;
}
