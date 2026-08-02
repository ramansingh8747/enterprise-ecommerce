/**
 * PaymentProviderFactory (Step 15.6).
 *
 * Resolves IPaymentProvider by configuration key.
 * No gateway calls — returns placeholder provider instances only.
 */

import { PAYMENT_DEFAULTS } from "../constants/payment.constants";
import { IPaymentProvider } from "../interfaces/payment-provider.interface";
import { CashfreeProvider } from "../providers/cashfree.provider";
import { MockProvider } from "../providers/mock.provider";
import { RazorpayProvider } from "../providers/razorpay.provider";
import { StripeProvider } from "../providers/stripe.provider";
import { PaymentProviderType } from "../types/payment.types";

/**
 * Maps provider configuration to a concrete IPaymentProvider.
 */
export class PaymentProviderFactory {
    /**
     * Returns a provider instance for the given key (or default mock).
     */
    static create(
        provider?: PaymentProviderType | string
    ): IPaymentProvider {
        const key = String(provider ?? PAYMENT_DEFAULTS.PROVIDER)
            .trim()
            .toLowerCase();

        switch (key) {
            case PaymentProviderType.RAZORPAY:
                return new RazorpayProvider();
            case PaymentProviderType.STRIPE:
                return new StripeProvider();
            case PaymentProviderType.CASHFREE:
                return new CashfreeProvider();
            case PaymentProviderType.MOCK:
                return new MockProvider();
            default:
                throw new Error(
                    `Unsupported payment provider: ${provider}. Allowed: ${Object.values(PaymentProviderType).join(", ")}.`
                );
        }
    }
}
