/**
 * Notification repository placeholder (Step 15.9).
 *
 * No persistence logic in this step.
 */

import { INotificationRepository } from "../interfaces/notification-repository.interface";

/**
 * Enterprise Notification Repository — persistence-only boundary (future).
 */
export class NotificationRepository implements INotificationRepository {
    async create(_data: unknown): Promise<unknown> {
        throw new Error(
            "NotificationRepository.create is not implemented yet."
        );
    }

    async findById(_id: string): Promise<unknown | null> {
        throw new Error(
            "NotificationRepository.findById is not implemented yet."
        );
    }

    async findByOrderId(_orderId: string): Promise<unknown[]> {
        throw new Error(
            "NotificationRepository.findByOrderId is not implemented yet."
        );
    }

    async updateById(_id: string, _data: unknown): Promise<unknown | null> {
        throw new Error(
            "NotificationRepository.updateById is not implemented yet."
        );
    }
}
