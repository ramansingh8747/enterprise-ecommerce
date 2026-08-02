/**
 * Payment DTOs (Step 15.6) — request/response shapes only.
 *
 * No business logic.
 */

import {
    PaymentCurrency,
    PaymentMethod,
    PaymentProviderType,
    PaymentStatus,
} from "../types/payment.types";

/**
 * Initiate a payment (future gateway create/order session).
 */
export interface CreatePaymentRequest {
    orderId: string;
    amount: number;
    currency?: PaymentCurrency | string;
    method?: PaymentMethod;
    provider?: PaymentProviderType;
    customerId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Provider-agnostic create-payment result.
 */
export interface CreatePaymentResponse {
    paymentId?: string;
    provider: PaymentProviderType;
    providerPaymentId?: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    /** Client payload for SDK checkout (provider-specific; opaque here). */
    clientPayload?: Record<string, unknown>;
}

/**
 * Verify a payment after client / webhook callback.
 */
export interface VerifyPaymentRequest {
    orderId?: string;
    providerPaymentId?: string;
    providerTransactionId?: string;
    provider?: PaymentProviderType;
    payload?: Record<string, unknown>;
}

/**
 * Request a refund against a prior payment.
 */
export interface RefundPaymentRequest {
    paymentId?: string;
    orderId?: string;
    providerPaymentId?: string;
    providerTransactionId?: string;
    amount?: number;
    reason?: string;
    provider?: PaymentProviderType;
}
