import { NotificationChannel } from '../types/notification.types';

/**
 * Universal, transport-agnostic delivery result wrapper returned by notification providers.
 */
export interface NotificationResult {
  /**
   * Boolean flag indicating whether provider dispatch succeeded.
   */
  success: boolean;

  /**
   * External provider message/transaction reference ID (e.g. SendGrid message ID, Twilio SID).
   */
  messageId?: string;

  /**
   * Name of the vendor provider executing the send (e.g., 'SendGridProvider', 'TwilioProvider').
   */
  provider?: string;

  /**
   * Channel used for delivery.
   */
  channel: NotificationChannel;

  /**
   * Error message description if dispatch failed.
   */
  error?: string;

  /**
   * UTC timestamp when the notification was delivered to vendor.
   */
  sentAt?: Date;

  /**
   * Number of retry attempts executed prior to final state.
   */
  retryCount?: number;
}
