import { PaymentMethod, PaymentProvider, PaymentType } from '../enums/payment.enums';

/**
 * Payment Create Request DTO (Module 27.5).
 *
 * Payload shape for initiating a new payment transaction.
 */
export interface PaymentCreateDto {
  /** Target system order ID string. */
  orderId: string;

  /** Monetary transaction amount. */
  amount: number;

  /** Optional ISO 4217 currency code (defaults to 'USD'). */
  currency?: string;

  /** Optional PaymentProvider enum (defaults to system default). */
  provider?: PaymentProvider;

  /** Payment method classification (CARD, UPI, NET_BANKING, etc.). */
  paymentMethod: PaymentMethod;

  /** Optional transaction operation type (defaults to PURCHASE). */
  paymentType?: PaymentType;

  /** Optional custom metadata key-value dictionary. */
  metadata?: Record<string, unknown>;
}
