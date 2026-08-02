/**
 * Notification repository contract (Step 15.9).
 *
 * Persistence boundary only — no delivery rules.
 */

/**
 * Enterprise Notification repository interface (DIP).
 * Method signatures for future Notification persistence.
 */
export interface INotificationRepository {
    create(data: unknown): Promise<unknown>;
    findById(id: string): Promise<unknown | null>;
    findByOrderId(orderId: string): Promise<unknown[]>;
    updateById(id: string, data: unknown): Promise<unknown | null>;
}
