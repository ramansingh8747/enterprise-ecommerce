/**
 * Payment provider contract (Step 15.6).
 *
 * Gateway abstraction — Order never depends on a concrete provider (DIP).
 * Method signatures only; implementations live under providers/.
 */

import {
    CreatePaymentRequest,
    CreatePaymentResponse,
    RefundPaymentRequest,
    VerifyPaymentRequest,
} from "../dto/payment.dto";

/**
 * Enterprise payment gateway adapter.
 */
export interface IPaymentProvider {
    readonly name: string;

    createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse>;

    verifyPayment(data: VerifyPaymentRequest): Promise<unknown>;

    cancelPayment(providerPaymentId: string): Promise<unknown>;

    refundPayment(data: RefundPaymentRequest): Promise<unknown>;
}
