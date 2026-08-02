/**
 * Email notification provider placeholder (Step 15.9 / Module 19.1).
 */

import {
  SendNotificationRequest,
  SendNotificationResponse,
} from "../dto/notification.dto";
import { INotificationProvider } from "../interfaces/notification-provider.interface";
import { NotificationChannel } from "../types/notification.types";
import { NotificationPayload } from "../interfaces/notification-payload.interface";
import { NotificationResult } from "../interfaces/notification-result.interface";

export class EmailNotificationProvider implements INotificationProvider {
  readonly providerName = 'EmailNotificationProvider';
  readonly channel = NotificationChannel.EMAIL;
  readonly name = NotificationChannel.EMAIL;

  supports(channel: NotificationChannel): boolean {
    return channel === NotificationChannel.EMAIL;
  }

  async send(
    _payload: NotificationPayload | SendNotificationRequest
  ): Promise<NotificationResult | SendNotificationResponse> {
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
