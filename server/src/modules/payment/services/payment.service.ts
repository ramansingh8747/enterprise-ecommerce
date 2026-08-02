/**
 * Payment service placeholder (Step 15.6).
 *
 * No gateway orchestration, webhooks, or Order updates in this step.
 */

import {
    CreatePaymentRequest,
    CreatePaymentResponse,
    RefundPaymentRequest,
    VerifyPaymentRequest,
} from "../dto/payment.dto";
import { IPaymentService } from "../interfaces/payment-service.interface";
import { PaymentRepository } from "../repositories/payment.repository";

/**
 * Enterprise Payment Service — application layer (placeholder).
 *
 * Future steps will resolve providers via PaymentProviderFactory
 * and persist via PaymentRepository; none of that runs here.
 */
export class PaymentService implements IPaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository = new PaymentRepository()
    ) {}

    async createPayment(
        _data: CreatePaymentRequest
    ): Promise<CreatePaymentResponse> {
        void this.paymentRepository;
        throw new Error("PaymentService.createPayment is not implemented yet.");
    }

    async verifyPayment(_data: VerifyPaymentRequest): Promise<unknown> {
        throw new Error("PaymentService.verifyPayment is not implemented yet.");
    }

    async cancelPayment(_paymentId: string): Promise<unknown> {
        throw new Error("PaymentService.cancelPayment is not implemented yet.");
    }

    async refundPayment(_data: RefundPaymentRequest): Promise<unknown> {
        throw new Error("PaymentService.refundPayment is not implemented yet.");
    }
}
