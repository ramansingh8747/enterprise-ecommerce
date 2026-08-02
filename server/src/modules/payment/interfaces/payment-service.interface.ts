/**
 * Payment service contract (Step 15.6).
 *
 * Application-layer boundary — placeholders only.
 */

import {
    CreatePaymentRequest,
    CreatePaymentResponse,
    RefundPaymentRequest,
    VerifyPaymentRequest,
} from "../dto/payment.dto";

/**
 * Enterprise Payment service interface (DIP).
 */
export interface IPaymentService {
    createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse>;
    verifyPayment(data: VerifyPaymentRequest): Promise<unknown>;
    cancelPayment(paymentId: string): Promise<unknown>;
    refundPayment(data: RefundPaymentRequest): Promise<unknown>;
}
