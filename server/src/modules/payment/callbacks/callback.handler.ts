import { PaymentStatus } from '../enums/payment.enums';

/**
 * Enterprise Payment Callback Handler (Module 27.4).
 *
 * Provides reusable, standardized response mapping helpers for payment success,
 * failure, cancellation, and refund HTTP callbacks.
 */
export class PaymentCallbackHandler {
  /**
   * Generates a standardized payment success callback envelope.
   *
   * @param paymentId System payment ID.
   * @param orderId Associated system order ID.
   * @param returnUrl Optional client return URL.
   */
  static handleSuccess(
    paymentId: string,
    orderId: string,
    returnUrl?: string
  ): Record<string, unknown> {
    return {
      status: PaymentStatus.SUCCESS,
      paymentId,
      orderId,
      success: true,
      message: 'Payment completed successfully.',
      redirectUrl: returnUrl ? `${returnUrl}?status=SUCCESS&paymentId=${paymentId}` : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generates a standardized payment failure callback envelope.
   *
   * @param paymentId System payment ID.
   * @param orderId Associated system order ID.
   * @param errorReason Human-readable error message.
   * @param cancelUrl Optional client cancel URL.
   */
  static handleFailure(
    paymentId: string,
    orderId: string,
    errorReason?: string,
    cancelUrl?: string
  ): Record<string, unknown> {
    return {
      status: PaymentStatus.FAILED,
      paymentId,
      orderId,
      success: false,
      error: errorReason || 'Payment failed during processing.',
      redirectUrl: cancelUrl ? `${cancelUrl}?status=FAILED&paymentId=${paymentId}` : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generates a standardized payment cancellation callback envelope.
   *
   * @param paymentId System payment ID.
   * @param orderId Associated system order ID.
   * @param cancelUrl Optional client cancel URL.
   */
  static handleCancellation(
    paymentId: string,
    orderId: string,
    cancelUrl?: string
  ): Record<string, unknown> {
    return {
      status: PaymentStatus.CANCELLED,
      paymentId,
      orderId,
      success: false,
      message: 'Payment cancelled by user.',
      redirectUrl: cancelUrl ? `${cancelUrl}?status=CANCELLED&paymentId=${paymentId}` : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generates a standardized refund callback envelope.
   *
   * @param refundId System refund ID.
   * @param paymentId Associated payment ID.
   * @param amount Refunded monetary amount.
   */
  static handleRefund(
    refundId: string,
    paymentId: string,
    amount: number
  ): Record<string, unknown> {
    return {
      status: PaymentStatus.REFUNDED,
      refundId,
      paymentId,
      amount,
      success: true,
      message: 'Refund processed successfully.',
      timestamp: new Date().toISOString(),
    };
  }
}
