/**
 * Notification domain shape placeholders (Step 15.9).
 */

import {
    NotificationChannel,
    NotificationStatus,
    NotificationTemplate,
    NotificationType,
} from "../types/notification.types";

/**
 * Future Notification aggregate (channel-agnostic).
 */
export interface INotification {
    channel: NotificationChannel;
    type: NotificationType;
    template?: NotificationTemplate;
    status: NotificationStatus;
    recipient?: string;
    subject?: string;
    body?: string;
    userId?: string;
    orderId?: string;
    providerMessageId?: string;
    metadata?: Record<string, unknown>;
    createdAt?: Date;
    updatedAt?: Date;
}
