import { INotification } from './notification.interface';
import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '../types/notification.types';

/**
 * Pagination, filtering, and sorting criteria for Notification repository queries.
 */
export interface INotificationQueryFilter {
  userId?: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  isRead?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated notification query result wrapper.
 */
export interface INotificationQueryResult {
  items: INotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Enterprise Notification Repository Interface Contract (Dependency Inversion Principle).
 */
export interface INotificationRepository {
  /**
   * Persists a new Notification document.
   */
  create(data: Partial<INotification>): Promise<INotification>;

  /**
   * Finds a Notification by its unique ID.
   */
  findById(id: string): Promise<INotification | null>;

  /**
   * Finds paginated notifications for a specific user.
   */
  findByUser(userId: string, filter?: INotificationQueryFilter): Promise<INotificationQueryResult>;

  /**
   * Finds paginated notifications by delivery status.
   */
  findByStatus(status: NotificationStatus, filter?: INotificationQueryFilter): Promise<INotificationQueryResult>;

  /**
   * Finds paginated notifications by delivery channel.
   */
  findByChannel(channel: NotificationChannel, filter?: INotificationQueryFilter): Promise<INotificationQueryResult>;

  /**
   * Finds paginated notifications by event type.
   */
  findByType(type: NotificationType, filter?: INotificationQueryFilter): Promise<INotificationQueryResult>;

  /**
   * Finds paginated unread notifications for a specific user.
   */
  findUnreadByUser(userId: string, filter?: INotificationQueryFilter): Promise<INotificationQueryResult>;

  /**
   * Finds notifications scheduled for execution at or before the specified date.
   */
  findScheduledReady(now?: Date, limit?: number): Promise<INotification[]>;

  /**
   * Updates an existing notification by ID.
   */
  update(id: string, data: Partial<INotification>): Promise<INotification | null>;

  /**
   * Updates notification status and optional failure reason.
   */
  updateStatus(id: string, status: NotificationStatus, failureReason?: string): Promise<INotification | null>;

  /**
   * Marks a single notification as read.
   */
  markAsRead(id: string): Promise<INotification | null>;

  /**
   * Marks multiple notifications as read for a user.
   */
  markMultipleAsRead(ids: string[]): Promise<number>;

  /**
   * Increments retry count and records failure diagnostic.
   */
  incrementRetryCount(id: string, failureReason?: string): Promise<INotification | null>;

  /**
   * Hard deletes a notification by ID.
   */
  delete(id: string): Promise<boolean>;

  /**
   * Counts total unread notifications for a user.
   */
  countUnread(userId: string): Promise<number>;

  // Backward compatibility placeholders
  findByOrderId?(orderId: string): Promise<INotification[]>;
  updateById?(id: string, data: unknown): Promise<INotification | null>;
}
