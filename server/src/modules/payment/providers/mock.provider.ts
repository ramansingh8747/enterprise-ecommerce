/**
 * Mock payment provider placeholder (Step 15.6).
 */

import {
    CreatePaymentRequest,
    CreatePaymentResponse,
    RefundPaymentRequest,
    VerifyPaymentRequest,
} from "../dto/payment.dto";
import { IPaymentProvider } from "../interfaces/payment-provider.interface";
import { PaymentProviderType } from "../types/payment.types";

export class MockProvider implements IPaymentProvider {
    readonly name = PaymentProviderType.MOCK;

    async createPayment(
        _data: CreatePaymentRequest
    ): Promise<CreatePaymentResponse> {
        throw new Error("Not Implemented");
    }

    async verifyPayment(_data: VerifyPaymentRequest): Promise<unknown> {
        throw new Error("Not Implemented");
    }

    async cancelPayment(_providerPaymentId: string): Promise<unknown> {
        throw new Error("Not Implemented");
    }

    async refundPayment(_data: RefundPaymentRequest): Promise<unknown> {
        throw new Error("Not Implemented");
    }
}
