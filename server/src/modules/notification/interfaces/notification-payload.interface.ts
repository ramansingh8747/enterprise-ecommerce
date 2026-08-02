import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '../types/notification.types';
import { NotificationRecipient } from './notification-recipient.interface';
import { NotificationAttachment } from './notification-attachment.interface';
import { NotificationMetadata } from './notification-metadata.interface';
import { NotificationContext } from './notification-context.interface';

/**
 * Universal, channel-agnostic notification dispatch message payload.
 */
export interface NotificationPayload {
  /**
   * Unique identifier of the notification payload.
   */
  id: string;

  /**
   * High-level domain notification type.
   */
  type: NotificationType;

  /**
   * Target delivery channel (EMAIL, SMS, PUSH, IN_APP, WEBHOOK).
   */
  channel: NotificationChannel;

  /**
   * Delivery priority level for routing and queue worker selection.
   */
  priority: NotificationPriority;

  /**
   * Recipient contact details.
   */
  recipient: NotificationRecipient;

  /**
   * Optional subject line (e.g. for EMAIL or PUSH title).
   */
  subject?: string;

  /**
   * Identifier of the template to be rendered.
   */
  templateId?: string;

  /**
   * Template injection context data.
   */
  context: NotificationContext;

  /**
   * Optional list of file attachments.
   */
  attachments?: NotificationAttachment[];

  /**
   * Audit telemetry and tracing metadata.
   */
  metadata: NotificationMetadata;

  /**
   * Current dispatch lifecycle status.
   */
  status: NotificationStatus;

  /**
   * Optional UTC date for deferred/scheduled notification dispatches.
   */
  scheduledAt?: Date;

  /**
   * UTC creation timestamp.
   */
  createdAt: Date;
}
