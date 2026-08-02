/**
 * Notification service contract (Step 15.9).
 *
 * Application-layer boundary — placeholders only.
 */

import {
    SendNotificationRequest,
    SendNotificationResponse,
} from "../dto/notification.dto";

/**
 * Enterprise Notification service interface (DIP).
 */
export interface INotificationService {
    send(data: SendNotificationRequest): Promise<SendNotificationResponse>;
    sendEmail(data: SendNotificationRequest): Promise<SendNotificationResponse>;
    sendSMS(data: SendNotificationRequest): Promise<SendNotificationResponse>;
    sendPush(data: SendNotificationRequest): Promise<SendNotificationResponse>;
}
