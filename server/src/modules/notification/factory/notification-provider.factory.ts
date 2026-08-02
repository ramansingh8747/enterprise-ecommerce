/**
 * NotificationProviderFactory (Step 15.9).
 *
 * Resolves INotificationProvider by configuration key.
 * No delivery calls — returns placeholder provider instances only.
 */

import { NOTIFICATION_DEFAULTS } from "../constants/notification.constants";
import { INotificationProvider } from "../interfaces/notification-provider.interface";
import { EmailNotificationProvider } from "../providers/email.provider";
import { MockNotificationProvider } from "../providers/mock.provider";
import { PushNotificationProvider } from "../providers/push.provider";
import { SmsNotificationProvider } from "../providers/sms.provider";
import { NotificationChannel } from "../types/notification.types";

/**
 * Maps channel configuration to a concrete INotificationProvider.
 */
export class NotificationProviderFactory {
    /**
     * Returns a provider instance for the given channel (or default mock).
     */
    static create(
        channel?: NotificationChannel | string
    ): INotificationProvider {
        const key = String(channel ?? NOTIFICATION_DEFAULTS.CHANNEL)
            .trim()
            .toLowerCase();

        switch (key) {
            case NotificationChannel.EMAIL:
                return new EmailNotificationProvider();
            case NotificationChannel.SMS:
                return new SmsNotificationProvider();
            case NotificationChannel.PUSH:
                return new PushNotificationProvider();
            case NotificationChannel.MOCK:
                return new MockNotificationProvider();
            default:
                throw new Error(
                    `Unsupported notification channel: ${channel}. Allowed: ${Object.values(NotificationChannel).join(", ")}.`
                );
        }
    }
}
