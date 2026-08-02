/**
 * Payment domain shape placeholders (Step 15.6).
 *
 * No Mongoose documents yet — foundation only.
 */

import {
    PaymentCurrency,
    PaymentMethod,
    PaymentProviderType,
    PaymentStatus,
} from "../types/payment.types";

/**
 * Future Payment aggregate (provider-agnostic).
 */
export interface IPayment {
    orderId: string;
    amount: number;
    currency: PaymentCurrency | string;
    method?: PaymentMethod;
    status: PaymentStatus;
    provider: PaymentProviderType;
    /** Provider-issued payment / order id (gateway-specific). */
    providerPaymentId?: string;
    /** Provider-issued transaction id (gateway-specific). */
    providerTransactionId?: string;
    metadata?: Record<string, unknown>;
    createdAt?: Date;
    updatedAt?: Date;
}
