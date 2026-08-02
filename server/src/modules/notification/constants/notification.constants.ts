/**
 * Enterprise Notification Module constants (Step 15.9).
 *
 * Shared labels and defaults only — no business logic.
 */

import {
    NotificationChannel,
    NotificationStatus,
    NotificationTemplate,
    NotificationType,
} from "../types/notification.types";

/**
 * Defaults for Notification operations (future steps).
 */
export const NOTIFICATION_DEFAULTS = {
    CHANNEL: NotificationChannel.MOCK,
    STATUS: NotificationStatus.PENDING,
    TYPE: NotificationType.GENERIC,
    TEMPLATE: NotificationTemplate.GENERIC,
} as const;

/**
 * Registered notification channel keys (factory lookup).
 */
export const NOTIFICATION_CHANNELS = Object.values(NotificationChannel);

/**
 * Notification type labels.
 */
export const NOTIFICATION_TYPES = Object.values(NotificationType);

/**
 * Notification status labels.
 */
export const NOTIFICATION_STATUSES = Object.values(NotificationStatus);

/**
 * Template name labels.
 */
export const NOTIFICATION_TEMPLATES = Object.values(NotificationTemplate);

/**
 * Placeholder collection names (persistence in a later step).
 */
export const NOTIFICATION_COLLECTIONS = {
    NOTIFICATIONS: "notifications",
    NOTIFICATION_LOGS: "notification_logs",
} as const;
