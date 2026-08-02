/**
 * Notification DTOs (Step 15.9) — request/response shapes only.
 *
 * No business logic / no delivery.
 */

import {
    NotificationChannel,
    NotificationStatus,
    NotificationTemplate,
    NotificationType,
} from "../types/notification.types";

/**
 * Initiate a notification (future provider send).
 */
export interface SendNotificationRequest {
    channel?: NotificationChannel;
    type?: NotificationType;
    template?: NotificationTemplate;
    recipient?: string;
    subject?: string;
    body?: string;
    userId?: string;
    orderId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Provider-agnostic send result placeholder.
 */
export interface SendNotificationResponse {
    notificationId?: string;
    channel: NotificationChannel;
    status: NotificationStatus;
    providerMessageId?: string;
}
