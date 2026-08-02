/**
 * Payment repository contract (Step 15.6).
 *
 * Persistence boundary only — no gateway rules.
 */

/**
 * Enterprise Payment repository interface (DIP).
 * Method signatures for future Payment persistence.
 */
export interface IPaymentRepository {
    create(data: unknown): Promise<unknown>;
    findById(id: string): Promise<unknown | null>;
    findByOrderId(orderId: string): Promise<unknown | null>;
    findByProviderTransactionId(
        providerTransactionId: string
    ): Promise<unknown | null>;
    updateById(id: string, data: unknown): Promise<unknown | null>;
}
