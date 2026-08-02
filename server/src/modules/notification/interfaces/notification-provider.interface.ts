/**
 * Notification provider contract (Step 15.9).
 *
 * Channel abstraction — Order never depends on a concrete vendor (DIP).
 * Method signatures only; implementations live under providers/.
 */

import {
    SendNotificationRequest,
    SendNotificationResponse,
} from "../dto/notification.dto";

/**
 * Enterprise notification channel adapter.
 */
export interface INotificationProvider {
    readonly name: string;

    send(data: SendNotificationRequest): Promise<SendNotificationResponse>;

    sendEmail(data: SendNotificationRequest): Promise<SendNotificationResponse>;

    sendSMS(data: SendNotificationRequest): Promise<SendNotificationResponse>;

    sendPush(data: SendNotificationRequest): Promise<SendNotificationResponse>;
}
