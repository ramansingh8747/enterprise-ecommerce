import {
  IPayment,
  IPaymentProvider,
  IPaymentRefund,
  IPaymentRequest,
  IPaymentResponse,
  IPaymentWebhook,
} from '../interfaces/payment.interfaces';
import { PaymentContext } from '../types/payment.types';

/**
 * Enterprise Abstract Payment Provider Base Class (Module 27.1).
 *
 * Pluggable transport provider base class for payment gateway operations.
 * Implements IPaymentProvider interface contract.
 *
 * Concrete gateway drivers (Mock, Stripe, Razorpay, PayPal) will extend this class in Module 27.2+.
 */
export class AbstractPaymentProvider implements IPaymentProvider {
  /**
   * Creates/initiates a payment transaction with the gateway.
   */
  async createPayment(
    _request: IPaymentRequest,
    _context?: PaymentContext
  ): Promise<IPaymentResponse> {
    throw new Error('AbstractPaymentProvider.createPayment() not implemented yet. Scheduled for Module 27.2.');
  }

  /**
   * Captures an authorized payment transaction.
   */
  async capturePayment(_paymentId: string, _amount?: number): Promise<IPaymentResponse> {
    throw new Error('AbstractPaymentProvider.capturePayment() not implemented yet. Scheduled for Module 27.2.');
  }

  /**
   * Verifies the authenticity and status of a payment transaction.
   */
  async verifyPayment(_paymentId: string, _payload?: Record<string, unknown>): Promise<IPaymentResponse> {
    throw new Error('AbstractPaymentProvider.verifyPayment() not implemented yet. Scheduled for Module 27.2.');
  }

  /**
   * Processes a full or partial refund for a payment.
   */
  async refundPayment(_paymentId: string, _amount: number, _reason?: string): Promise<IPaymentRefund> {
    throw new Error('AbstractPaymentProvider.refundPayment() not implemented yet. Scheduled for Module 27.2.');
  }

  /**
   * Cancels a pending or authorized payment transaction.
   */
  async cancelPayment(_paymentId: string, _reason?: string): Promise<IPaymentResponse> {
    throw new Error('AbstractPaymentProvider.cancelPayment() not implemented yet. Scheduled for Module 27.2.');
  }

  /**
   * Retrieves current payment details directly from the provider or system.
   */
  async getPayment(_paymentId: string): Promise<IPayment | null> {
    throw new Error('AbstractPaymentProvider.getPayment() not implemented yet. Scheduled for Module 27.2.');
  }

  /**
   * Validates and parses an incoming gateway webhook request payload.
   */
  async validateWebhook(
    _payload: Record<string, unknown>,
    _signature: string
  ): Promise<IPaymentWebhook> {
    throw new Error('AbstractPaymentProvider.validateWebhook() not implemented yet. Scheduled for Module 27.2.');
  }
}
