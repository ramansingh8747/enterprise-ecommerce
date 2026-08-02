/**
 * Transport-agnostic recipient target data model.
 */
export interface NotificationRecipient {
  /**
   * Optional unique user identifier if recipient is a registered user.
   */
  userId?: string;

  /**
   * Email address for EMAIL channel delivery.
   */
  email?: string;

  /**
   * E.164 formatted phone number for SMS channel delivery.
   */
  phone?: string;

  /**
   * FCM / APNS token for PUSH notification channel delivery.
   */
  deviceToken?: string;

  /**
   * HTTP endpoint URL for WEBHOOK channel delivery.
   */
  webhookUrl?: string;

  /**
   * Recipient display name for personalization.
   */
  name?: string;
}
