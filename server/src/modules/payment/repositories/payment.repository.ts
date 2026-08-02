/**
 * Payment repository placeholder (Step 15.6).
 *
 * No persistence logic in this step.
 */

import { IPaymentRepository } from "../interfaces/payment-repository.interface";

/**
 * Enterprise Payment Repository — persistence-only boundary (future).
 */
export class PaymentRepository implements IPaymentRepository {
    async create(_data: unknown): Promise<unknown> {
        throw new Error("PaymentRepository.create is not implemented yet.");
    }

    async findById(_id: string): Promise<unknown | null> {
        throw new Error("PaymentRepository.findById is not implemented yet.");
    }

    async findByOrderId(_orderId: string): Promise<unknown | null> {
        throw new Error(
            "PaymentRepository.findByOrderId is not implemented yet."
        );
    }

    async findByProviderTransactionId(
        _providerTransactionId: string
    ): Promise<unknown | null> {
        throw new Error(
            "PaymentRepository.findByProviderTransactionId is not implemented yet."
        );
    }

    async updateById(_id: string, _data: unknown): Promise<unknown | null> {
        throw new Error("PaymentRepository.updateById is not implemented yet.");
    }
}
