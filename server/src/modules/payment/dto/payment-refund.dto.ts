/**
 * Payment Refund Request DTO (Module 27.5).
 *
 * Payload shape for requesting full or partial refund for a payment.
 */
export interface PaymentRefundDto {
  /** Target system payment ID string. */
  paymentId: string;

  /** Refund monetary amount. */
  amount: number;

  /** Optional human-readable refund reason. */
  reason?: string;

  /** Optional metadata tags or correlation info. */
  metadata?: Record<string, unknown>;
}
