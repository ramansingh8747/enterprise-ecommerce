/**
 * Payment Capture Request DTO (Module 27.5).
 *
 * Payload shape for capturing an authorized payment transaction.
 */
export interface PaymentCaptureDto {
  /** Target system payment ID string. */
  paymentId: string;

  /** Optional gateway payment token ID. */
  gatewayPaymentId?: string;

  /** Optional capture amount (for partial captures). */
  amount?: number;

  /** Optional custom capture metadata. */
  metadata?: Record<string, unknown>;
}
