/**
 * Email notification provider placeholder (Step 15.9).
 * No SES / SendGrid / SMTP integration in this step.
 */

import {
    SendNotificationRequest,
    SendNotificationResponse,
} from "../dto/notification.dto";
import { INotificationProvider } from "../interfaces/notification-provider.interface";
import { NotificationChannel } from "../types/notification.types";

export class EmailNotificationProvider implements INotificationProvider {
    readonly name = NotificationChannel.EMAIL;

    async send(
        _data: SendNotificationRequest
    ): Promise<SendNotificationResponse> {
        throw new Error("Not Implemented");
    }

    async sendEmail(
        _data: SendNotificationRequest
    ): Promise<SendNotificationResponse> {
        throw new Error("Not Implemented");
    }

    async sendSMS(
        _data: SendNotificationRequest
    ): Promise<SendNotificationResponse> {
        throw new Error("Not Implemented");
    }

    async sendPush(
        _data: SendNotificationRequest
    ): Promise<SendNotificationResponse> {
        throw new Error("Not Implemented");
    }
}
