import { NotificationChannel } from '../types/notification.types';
import { NotificationPayload } from './notification-payload.interface';
import { NotificationResult } from './notification-result.interface';
import { SendNotificationRequest, SendNotificationResponse } from '../dto/notification.dto';

/**
 * Universal Notification Provider Contract (Strategy Pattern / Dependency Inversion Principle).
 * 
 * Defines the contract that every channel-specific provider (SendGrid, Twilio, FCM, Webhook)
 * must implement to plug into the notification architecture seamlessly.
 */
export interface INotificationProvider {
  /**
   * Vendor/Adapter identifier name (e.g., 'SendGridEmailProvider', 'TwilioSmsProvider').
   */
  readonly providerName?: string;

  /**
   * Primary notification channel handled by this provider instance.
   */
  readonly channel?: NotificationChannel;

  /**
   * Legacy provider name placeholder.
   */
  readonly name?: string;

  /**
   * Primary architecture-level dispatch method.
   */
  send(payload: NotificationPayload | SendNotificationRequest): Promise<NotificationResult | SendNotificationResponse>;

  /**
   * Evaluates whether this provider handles the requested notification channel.
   */
  supports?(channel: NotificationChannel): boolean;

  // Backward compatibility signatures
  sendEmail?(data: SendNotificationRequest): Promise<SendNotificationResponse>;
  sendSMS?(data: SendNotificationRequest): Promise<SendNotificationResponse>;
  sendPush?(data: SendNotificationRequest): Promise<SendNotificationResponse>;
}
