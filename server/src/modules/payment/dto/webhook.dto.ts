import { PaymentProvider } from '../enums/payment.enums';

/**
 * Webhook Request DTO (Module 27.5).
 *
 * Payload shape received when receiving gateway webhooks.
 */
export interface WebhookDto {
  /** Target payment provider (e.g., 'STRIPE', 'RAZORPAY', 'MOCK'). */
  provider: PaymentProvider | string;

  /** Gateway signature header or payload signature. */
  signature?: string;

  /** Gateway request event payload object. */
  payload: Record<string, unknown>;

  /** Optional event timestamp in milliseconds or ISO format. */
  timestamp?: number | string;
}
