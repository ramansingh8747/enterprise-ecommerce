/**
 * SMS notification provider placeholder (Step 15.9).
 * No Twilio / MSG91 integration in this step.
 */

import {
    SendNotificationRequest,
    SendNotificationResponse,
} from "../dto/notification.dto";
import { INotificationProvider } from "../interfaces/notification-provider.interface";
import { NotificationChannel } from "../types/notification.types";

export class SmsNotificationProvider implements INotificationProvider {
    readonly name = NotificationChannel.SMS;

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
