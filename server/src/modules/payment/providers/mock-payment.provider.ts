import {
  IPayment,
  IPaymentProvider,
  IPaymentRefund,
  IPaymentRequest,
  IPaymentResponse,
  IPaymentWebhook,
} from '../interfaces/payment.interfaces';
import { PaymentContext } from '../types/payment.types';
import { PaymentMethod, PaymentProvider, PaymentStatus, PaymentType } from '../enums/payment.enums';
import { DEFAULT_CURRENCY, PAYMENT_ID_PREFIX, REFUND_ID_PREFIX } from '../constants/payment.constants';
import { PaymentUtil } from '../utils/payment.util';

/**
 * Enterprise Production Mock Payment Provider Driver (Module 27.4).
 *
 * Fully compliant mock driver implementing IPaymentProvider contract for testing,
 * local development, and sandboxed simulation.
 * Produces deterministic, strongly-typed payment responses without contacting external APIs.
 */
export class MockPaymentProvider implements IPaymentProvider {
  /**
   * Initiates a mock payment transaction.
   */
  async createPayment(request: IPaymentRequest, _context?: PaymentContext): Promise<IPaymentResponse> {
    const paymentId = PaymentUtil.generatePaymentId(PAYMENT_ID_PREFIX);
    const mockTransactionId = `mock_tx_${Date.now()}`;
    const mockClientSecret = `mock_secret_${paymentId}`;
    const currency = request.currency || DEFAULT_CURRENCY;

    return {
      paymentId,
      orderId: request.orderId,
      amount: request.amount,
      currency,
      status: PaymentStatus.PENDING,
      provider: PaymentProvider.MOCK,
      transactionId: mockTransactionId,
      clientSecret: mockClientSecret,
      redirectUrl: `https://checkout.mockpayment.internal/pay?session=${mockClientSecret}`,
      rawGatewayResponse: {
        gateway: 'MockPaymentDriver',
        resultCode: '00',
        authorizedAmount: request.amount,
      },
    };
  }

  /**
   * Captures a mock authorized payment transaction.
   */
  async capturePayment(paymentId: string, amount?: number): Promise<IPaymentResponse> {
    return {
      paymentId,
      orderId: `ord_${paymentId}`,
      amount: amount || 100,
      currency: DEFAULT_CURRENCY,
      status: PaymentStatus.CAPTURED,
      provider: PaymentProvider.MOCK,
      transactionId: `mock_tx_cap_${Date.now()}`,
      rawGatewayResponse: {
        gateway: 'MockPaymentDriver',
        captured: true,
      },
    };
  }

  /**
   * Verifies the authenticity and status of a mock payment transaction.
   */
  async verifyPayment(paymentId: string, payload?: Record<string, unknown>): Promise<IPaymentResponse> {
    const isSuccess = payload?.status !== 'FAILED';
    const status = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

    return {
      paymentId,
      orderId: String(payload?.orderId || `ord_${paymentId}`),
      amount: Number(payload?.amount || 100),
      currency: DEFAULT_CURRENCY,
      status,
      provider: PaymentProvider.MOCK,
      transactionId: `mock_tx_ver_${Date.now()}`,
      rawGatewayResponse: {
        gateway: 'MockPaymentDriver',
        verified: isSuccess,
      },
    };
  }

  /**
   * Processes a mock refund for a payment.
   */
  async refundPayment(paymentId: string, amount: number, reason?: string): Promise<IPaymentRefund> {
    const refundId = PaymentUtil.generatePaymentId(REFUND_ID_PREFIX);

    return {
      refundId,
      paymentId,
      amount,
      currency: DEFAULT_CURRENCY,
      reason: reason || 'Mock refund processed successfully',
      status: PaymentStatus.REFUNDED,
      createdAt: new Date(),
    };
  }

  /**
   * Cancels a mock pending payment transaction.
   */
  async cancelPayment(paymentId: string, _reason?: string): Promise<IPaymentResponse> {
    return {
      paymentId,
      orderId: `ord_${paymentId}`,
      amount: 0,
      currency: DEFAULT_CURRENCY,
      status: PaymentStatus.CANCELLED,
      provider: PaymentProvider.MOCK,
      rawGatewayResponse: {
        gateway: 'MockPaymentDriver',
        cancelled: true,
      },
    };
  }

  /**
   * Retrieves mock payment transaction details.
   */
  async getPayment(paymentId: string): Promise<IPayment | null> {
    return {
      id: paymentId,
      paymentId,
      orderId: `ord_${paymentId}`,
      customerId: 'cust_mock_123',
      amount: 100,
      currency: DEFAULT_CURRENCY,
      status: PaymentStatus.SUCCESS,
      provider: PaymentProvider.MOCK,
      method: PaymentMethod.CARD,
      type: PaymentType.PURCHASE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Validates and parses a mock gateway webhook request payload.
   */
  async validateWebhook(payload: Record<string, unknown>, _signature: string): Promise<IPaymentWebhook> {
    return {
      eventId: String(payload.eventId || `evt_mock_${Date.now()}`),
      eventType: String(payload.eventType || 'payment.captured'),
      provider: PaymentProvider.MOCK,
      payload,
      receivedAt: new Date(),
    };
  }
}
