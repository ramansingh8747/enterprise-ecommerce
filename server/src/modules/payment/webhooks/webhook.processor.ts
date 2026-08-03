import { IPaymentService } from '../interfaces/payment.interfaces';
import { IPaymentWebhook } from '../interfaces/payment.interfaces';

/**
 * Enterprise Webhook Event Processor (Module 27.4).
 *
 * Processes normalized gateway webhook events (`payment.captured`, `payment.failed`,
 * `payment.refunded`, `payment.cancelled`) and delegates state synchronization
 * to the IPaymentService abstraction.
 *
 * Contains zero direct database or repository calls.
 */
export class WebhookProcessor {
  constructor(private readonly paymentService: IPaymentService) {}

  /**
   * Processes a normalized incoming webhook event.
   *
   * @param webhook IPaymentWebhook event container.
   * @returns Processing success indicator and message.
   */
  async processEvent(webhook: IPaymentWebhook): Promise<{ success: boolean; message: string }> {
    const { eventType, payload } = webhook;
    const paymentId = String(payload.paymentId || payload.id || '');

    if (!paymentId) {
      return { success: false, message: "Webhook payload missing required 'paymentId' field." };
    }

    switch (eventType.toLowerCase()) {
      case 'payment.created':
      case 'payment_intent.created':
        return { success: true, message: `Webhook event '${eventType}' acknowledged for payment '${paymentId}'.` };

      case 'payment.authorized':
      case 'payment_intent.amount_capturable_updated':
        await this.paymentService.capture(paymentId);
        return { success: true, message: `Payment '${paymentId}' captured automatically on authorization event.` };

      case 'payment.captured':
      case 'payment.success':
      case 'payment_intent.succeeded':
      case 'charge.succeeded':
        await this.paymentService.verify(paymentId, payload);
        return { success: true, message: `Payment '${paymentId}' verified and updated to SUCCESS.` };

      case 'payment.failed':
      case 'payment_intent.payment_failed':
      case 'charge.failed':
        await this.paymentService.cancel(paymentId, String(payload.failureReason || 'Payment failed on gateway'));
        return { success: true, message: `Payment '${paymentId}' marked FAILED.` };

      case 'payment.cancelled':
      case 'payment_intent.canceled':
        await this.paymentService.cancel(paymentId, String(payload.cancellationReason || 'Cancelled by user'));
        return { success: true, message: `Payment '${paymentId}' marked CANCELLED.` };

      case 'payment.refunded':
      case 'charge.refunded': {
        const refundAmount = Number(payload.refundAmount || payload.amount_refunded || 0);
        const reason = String(payload.refundReason || 'Refunded via gateway webhook');
        if (refundAmount > 0) {
          await this.paymentService.refund(paymentId, refundAmount, reason);
        }
        return { success: true, message: `Refund processed for payment '${paymentId}'.` };
      }

      default:
        return { success: true, message: `Unhandled event type '${eventType}' ignored safely.` };
    }
  }
}
