import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
} from '../enums/payment.enums';
import {
  PaymentContext,
  PaymentFilters,
  PaymentMetrics,
  PaymentPagination,
  PaymentSummary,
} from '../types/payment.types';

/**
 * Enterprise Payment Gateway Module — Domain Interfaces (Module 27.1).
 *
 * Framework-agnostic contracts establishing interfaces for payment documents,
 * requests, responses, refunds, webhooks, providers, services, and statistics.
 */

/**
 * Domain Payment Record representation.
 */
export interface IPayment {
  id: string;
  paymentId: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  method: PaymentMethod;
  type: PaymentType;
  transactionId?: string;
  clientSecret?: string;
  gatewayResponse?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  capturedAt?: Date;
  failedAt?: Date;
}

/**
 * Request DTO shape for initiating a payment.
 */
export interface IPaymentRequest {
  orderId: string;
  customerId: string;
  amount: number;
  currency?: string;
  provider?: PaymentProvider;
  method: PaymentMethod;
  type?: PaymentType;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Standardized response envelope returned by payment gateways.
 */
export interface IPaymentResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  transactionId?: string;
  clientSecret?: string;
  redirectUrl?: string;
  rawGatewayResponse?: Record<string, unknown>;
}

/**
 * Request payload for processing a refund.
 */
export interface IPaymentRefund {
  refundId: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason?: string;
  status: PaymentStatus;
  createdAt: Date;
}

/**
 * Payload envelope for incoming gateway webhook events.
 */
export interface IPaymentWebhook {
  eventId: string;
  eventType: string;
  provider: PaymentProvider;
  signature?: string;
  payload: Record<string, unknown>;
  receivedAt: Date;
}

/**
 * Aggregate statistics report for payment transactions.
 */
export interface IPaymentStatistics {
  provider: PaymentProvider;
  metrics: PaymentMetrics;
  byStatus: Record<PaymentStatus, number>;
  byMethod: Record<PaymentMethod, number>;
}

/**
 * Low-level Payment Provider transport contract.
 */
export interface IPaymentProvider {
  /**
   * Creates/initiates a payment transaction with the gateway.
   *
   * @param request Payment request payload.
   * @param context Execution context.
   */
  createPayment(request: IPaymentRequest, context?: PaymentContext): Promise<IPaymentResponse>;

  /**
   * Captures an authorized payment transaction.
   *
   * @param paymentId System payment ID.
   * @param amount Optional partial capture amount.
   */
  capturePayment(paymentId: string, amount?: number): Promise<IPaymentResponse>;

  /**
   * Verifies the authenticity and status of a payment transaction.
   *
   * @param paymentId System payment ID.
   * @param payload Optional gateway signature verification payload.
   */
  verifyPayment(paymentId: string, payload?: Record<string, unknown>): Promise<IPaymentResponse>;

  /**
   * Processes a full or partial refund for a payment.
   *
   * @param paymentId System payment ID.
   * @param amount Refund amount.
   * @param reason Human-readable refund reason.
   */
  refundPayment(paymentId: string, amount: number, reason?: string): Promise<IPaymentRefund>;

  /**
   * Cancels a pending or authorized payment transaction.
   *
   * @param paymentId System payment ID.
   * @param reason Cancellation reason.
   */
  cancelPayment(paymentId: string, reason?: string): Promise<IPaymentResponse>;

  /**
   * Retrieves current payment details directly from the provider or system.
   *
   * @param paymentId System payment ID.
   */
  getPayment(paymentId: string): Promise<IPayment | null>;

  /**
   * Validates and parses an incoming gateway webhook request payload.
   *
   * @param payload Raw request payload body.
   * @param signature Gateway signature header value.
   */
  validateWebhook(payload: Record<string, unknown>, signature: string): Promise<IPaymentWebhook>;
}

/**
 * High-level Payment Application Service contract (Dependency Inversion Principle).
 */
export interface IPaymentService {
  create(request: IPaymentRequest, context?: PaymentContext): Promise<IPaymentResponse>;
  capture(paymentId: string, amount?: number): Promise<IPaymentResponse>;
  verify(paymentId: string, payload?: Record<string, unknown>): Promise<IPaymentResponse>;
  refund(paymentId: string, amount: number, reason?: string): Promise<IPaymentRefund>;
  cancel(paymentId: string, reason?: string): Promise<IPaymentResponse>;
  find(
    filters: PaymentFilters,
    pagination: PaymentPagination
  ): Promise<{ items: IPayment[]; total: number; page: number; limit: number; totalPages: number }>;
  findById(paymentId: string): Promise<IPayment | null>;
  statistics(filters?: PaymentFilters): Promise<IPaymentStatistics>;
}
