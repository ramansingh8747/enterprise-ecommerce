/**
 * Notification service placeholder (Step 15.9).
 *
 * No delivery, queue, retry, or Order hooks in this step.
 */

import {
    SendNotificationRequest,
    SendNotificationResponse,
} from "../dto/notification.dto";
import { INotificationService } from "../interfaces/notification-service.interface";
import { NotificationRepository } from "../repositories/notification.repository";

/**
 * Enterprise Notification Service — application layer (placeholder).
 *
 * Future steps will resolve providers via NotificationProviderFactory
 * and persist via NotificationRepository; none of that runs here.
 */
export class NotificationService implements INotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository = new NotificationRepository()
    ) {}

    async send(
        _data: SendNotificationRequest
    ): Promise<SendNotificationResponse> {
        void this.notificationRepository;
        throw new Error(
            "NotificationService.send is not implemented yet."
        );
    }

    async sendEmail(
        _data: SendNotificationRequest
    ): Promise<SendNotificationResponse> {
        throw new Error(
            "NotificationService.sendEmail is not implemented yet."
        );
    }

    async sendSMS(
        _data: SendNotificationRequest
    ): Promise<SendNotificationResponse> {
        throw new Error(
            "NotificationService.sendSMS is not implemented yet."
        );
    }

    async sendPush(
        _data: SendNotificationRequest
    ): Promise<SendNotificationResponse> {
        throw new Error(
            "NotificationService.sendPush is not implemented yet."
        );
    }
}
