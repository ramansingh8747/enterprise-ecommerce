import { Types } from 'mongoose';
import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationTemplate,
  NotificationType,
} from '../types/notification.types';
import { NotificationRecipient } from './notification-recipient.interface';
import { NotificationAttachment } from './notification-attachment.interface';
import { NotificationMetadata } from './notification-metadata.interface';
import { NotificationContext } from './notification-context.interface';

/**
 * Enterprise Notification Aggregate Domain Interface (Module 19.2).
 * Provider-agnostic domain entity shape.
 */
export interface INotification {
  _id?: Types.ObjectId | string;
  userId?: Types.ObjectId | string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  title?: string;
  message: string;
  payload?: NotificationContext;
  metadata?: NotificationMetadata | Record<string, unknown>;
  recipient: NotificationRecipient;
  attachments?: NotificationAttachment[];
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  isRead: boolean;
  createdBy?: Types.ObjectId | string;
  updatedBy?: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;

  // Backward compatibility optional fields
  template?: NotificationTemplate;
  subject?: string;
  body?: string;
  orderId?: string;
  providerMessageId?: string;
}
