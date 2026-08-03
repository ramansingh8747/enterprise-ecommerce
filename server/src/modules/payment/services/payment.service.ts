import {
  IPayment,
  IPaymentProvider,
  IPaymentRefund,
  IPaymentRequest,
  IPaymentResponse,
  IPaymentService,
  IPaymentStatistics,
} from '../interfaces/payment.interfaces';
import { IPaymentRepository } from '../repositories/payment.repository';
import { IPaymentDocument } from '../models/payment.model';
import { PaymentContext, PaymentFilters, PaymentPagination } from '../types/payment.types';
import { PaymentMethod, PaymentProvider, PaymentStatus, PaymentType } from '../enums/payment.enums';
import { PaymentUtil } from '../utils/payment.util';
import { DEFAULT_PAYMENT_CONFIG, IPaymentConfig } from '../config/payment.config';
import { REFUND_ID_PREFIX } from '../constants/payment.constants';

/**
 * Enterprise Payment Application Service Implementation (Module 27.3).
 *
 * Core business logic layer for the Payment Gateway module.
 * Orchestrates payment creation, authorization, capture, verification, refund processing,
 * cancellation, paginated lookups, and statistical reporting.
 *
 * Communicates strictly through IPaymentRepository and IPaymentProvider interfaces (DIP).
 */
export class PaymentService implements IPaymentService {
  constructor(
    private readonly repository: IPaymentRepository,
    private readonly paymentProvider: IPaymentProvider,
    private readonly config: IPaymentConfig = DEFAULT_PAYMENT_CONFIG
  ) {}

  /* ========================================================================
     PRIVATE HELPER MAPPERS & VALIDATORS
     ====================================================================== */

  /**
   * Maps Mongoose IPaymentDocument to domain IPayment entity interface.
   */
  private mapDocumentToPayment(doc: IPaymentDocument): IPayment {
    return {
      id: doc._id ? doc._id.toString() : doc.paymentId,
      paymentId: doc.paymentId,
      orderId: doc.orderId,
      customerId: doc.userId,
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status,
      provider: doc.provider,
      method: doc.paymentMethod,
      type: doc.paymentType,
      transactionId: doc.gatewayTransactionId,
      clientSecret: doc.gatewayPaymentId,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      capturedAt: doc.completedAt,
      failedAt: doc.status === PaymentStatus.FAILED ? doc.updatedAt : undefined,
    };
  }

  /**
   * Validates incoming payment request parameters.
   */
  private validatePaymentRequest(request: IPaymentRequest): void {
    if (!request.orderId || !String(request.orderId).trim()) {
      throw new Error('Invalid payment request: orderId is required.');
    }
    if (!request.customerId || !String(request.customerId).trim()) {
      throw new Error('Invalid payment request: customerId is required.');
    }
    if (!PaymentUtil.validateAmount(request.amount)) {
      throw new Error(`Invalid payment request: amount must be a positive number up to maximum limits.`);
    }
  }

  /* ========================================================================
     PUBLIC SERVICE METHODS
     ====================================================================== */

  /**
   * Initiates and persists a new payment transaction.
   *
   * @param request Payment request payload.
   * @param context Execution context.
   */
  async create(request: IPaymentRequest, context?: PaymentContext): Promise<IPaymentResponse> {
    this.validatePaymentRequest(request);

    const paymentId = PaymentUtil.generatePaymentId();
    const currency = PaymentUtil.normalizeCurrency(request.currency || this.config.defaultCurrency);
    const provider = request.provider || this.config.provider || PaymentProvider.MOCK;
    const metadata = PaymentUtil.buildMetadata(request.metadata);

    // 1. Initial persistence in CREATED state
    const createdDoc = await this.repository.create({
      paymentId,
      orderId: request.orderId.trim(),
      userId: request.customerId.trim(),
      provider,
      paymentMethod: request.method,
      paymentType: request.type || PaymentType.PURCHASE,
      status: PaymentStatus.CREATED,
      currency,
      amount: request.amount,
      paidAmount: 0,
      refundedAmount: 0,
      metadata,
    });

    // 2. Delegate creation to PaymentProvider driver
    let providerResponse: IPaymentResponse;
    try {
      providerResponse = await this.paymentProvider.createPayment(
        {
          ...request,
          currency,
          provider,
        },
        context
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await this.repository.update(createdDoc._id.toString(), {
        status: PaymentStatus.FAILED,
        failureReason: errorMsg,
      });

      return {
        paymentId,
        orderId: request.orderId,
        amount: request.amount,
        currency,
        status: PaymentStatus.FAILED,
        provider,
        rawGatewayResponse: { error: errorMsg },
      };
    }

    // 3. Update document with provider response tokens & status
    await this.repository.update(createdDoc._id.toString(), {
      status: providerResponse.status || PaymentStatus.PENDING,
      gatewayTransactionId: providerResponse.transactionId,
      gatewayPaymentId: providerResponse.clientSecret,
    });

    return {
      paymentId,
      orderId: request.orderId,
      amount: request.amount,
      currency,
      status: providerResponse.status || PaymentStatus.PENDING,
      provider,
      transactionId: providerResponse.transactionId,
      clientSecret: providerResponse.clientSecret,
      redirectUrl: providerResponse.redirectUrl,
      rawGatewayResponse: providerResponse.rawGatewayResponse,
    };
  }

  /**
   * Captures an authorized payment transaction.
   *
   * @param paymentId System payment ID.
   * @param amount Optional partial capture amount.
   */
  async capture(paymentId: string, amount?: number): Promise<IPaymentResponse> {
    const doc = await this.repository.findByPaymentId(paymentId) || await this.repository.findById(paymentId);
    if (!doc) {
      throw new Error(`Payment transaction not found for paymentId: '${paymentId}'.`);
    }

    if (doc.status === PaymentStatus.CAPTURED || doc.status === PaymentStatus.SUCCESS) {
      return {
        paymentId: doc.paymentId,
        orderId: doc.orderId,
        amount: doc.paidAmount || doc.amount,
        currency: doc.currency,
        status: doc.status,
        provider: doc.provider,
        transactionId: doc.gatewayTransactionId,
      };
    }

    if (doc.status !== PaymentStatus.AUTHORIZED && doc.status !== PaymentStatus.PROCESSING && doc.status !== PaymentStatus.PENDING) {
      throw new Error(`Cannot capture payment '${paymentId}' in current state '${doc.status}'.`);
    }

    const captureAmount = amount && amount > 0 ? amount : doc.amount;
    const providerResponse = await this.paymentProvider.capturePayment(doc.paymentId, captureAmount);

    await this.repository.update(doc._id.toString(), {
      status: providerResponse.status || PaymentStatus.CAPTURED,
      paidAmount: captureAmount,
      completedAt: new Date(),
    });

    return {
      paymentId: doc.paymentId,
      orderId: doc.orderId,
      amount: captureAmount,
      currency: doc.currency,
      status: providerResponse.status || PaymentStatus.CAPTURED,
      provider: doc.provider,
      transactionId: providerResponse.transactionId || doc.gatewayTransactionId,
    };
  }

  /**
   * Verifies the status of a payment transaction.
   *
   * @param paymentId System payment ID.
   * @param payload Optional gateway signature verification payload.
   */
  async verify(paymentId: string, payload?: Record<string, unknown>): Promise<IPaymentResponse> {
    const doc = await this.repository.findByPaymentId(paymentId) || await this.repository.findById(paymentId);
    if (!doc) {
      throw new Error(`Payment transaction not found for paymentId: '${paymentId}'.`);
    }

    const providerResponse = await this.paymentProvider.verifyPayment(doc.paymentId, payload);

    await this.repository.update(doc._id.toString(), {
      status: providerResponse.status,
      gatewayTransactionId: providerResponse.transactionId || doc.gatewayTransactionId,
      completedAt: providerResponse.status === PaymentStatus.SUCCESS ? new Date() : doc.completedAt,
    });

    return providerResponse;
  }

  /**
   * Processes a full or partial refund for a completed payment.
   *
   * @param paymentId System payment ID.
   * @param amount Refund amount.
   * @param reason Human-readable refund reason.
   */
  async refund(paymentId: string, amount: number, reason?: string): Promise<IPaymentRefund> {
    const doc = await this.repository.findByPaymentId(paymentId) || await this.repository.findById(paymentId);
    if (!doc) {
      throw new Error(`Payment transaction not found for paymentId: '${paymentId}'.`);
    }

    if (doc.status !== PaymentStatus.SUCCESS && doc.status !== PaymentStatus.CAPTURED && doc.status !== PaymentStatus.PARTIALLY_REFUNDED) {
      throw new Error(`Cannot refund payment '${paymentId}' in state '${doc.status}'. Payment must be SUCCESS or CAPTURED.`);
    }

    const currentPaid = doc.paidAmount || doc.amount;
    const currentRefunded = doc.refundedAmount || 0;
    const availableRefundable = currentPaid - currentRefunded;

    if (amount <= 0 || amount > availableRefundable) {
      throw new Error(
        `Invalid refund amount ${amount}. Maximum refundable balance is ${availableRefundable} ${doc.currency}.`
      );
    }

    // Delegate refund to PaymentProvider driver
    const refundResult = await this.paymentProvider.refundPayment(doc.paymentId, amount, reason);

    const newRefundedAmount = currentRefunded + amount;
    const newStatus = newRefundedAmount >= currentPaid ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

    const refundEntry = {
      refundId: refundResult.refundId || PaymentUtil.generatePaymentId(REFUND_ID_PREFIX),
      amount,
      reason,
      status: newStatus,
      processedAt: new Date(),
    };

    const existingRefunds = doc.refunds || [];

    await this.repository.update(doc._id.toString(), {
      status: newStatus,
      refundedAmount: newRefundedAmount,
      refunds: [...existingRefunds, refundEntry],
    });

    return {
      refundId: refundEntry.refundId,
      paymentId: doc.paymentId,
      amount,
      currency: doc.currency,
      reason,
      status: newStatus,
      createdAt: refundEntry.processedAt,
    };
  }

  /**
   * Cancels a pending or authorized payment transaction.
   *
   * @param paymentId System payment ID.
   * @param reason Cancellation reason.
   */
  async cancel(paymentId: string, reason?: string): Promise<IPaymentResponse> {
    const doc = await this.repository.findByPaymentId(paymentId) || await this.repository.findById(paymentId);
    if (!doc) {
      throw new Error(`Payment transaction not found for paymentId: '${paymentId}'.`);
    }

    if (doc.status === PaymentStatus.SUCCESS || doc.status === PaymentStatus.CAPTURED || doc.status === PaymentStatus.REFUNDED) {
      throw new Error(`Cannot cancel payment '${paymentId}' in terminal state '${doc.status}'.`);
    }

    const providerResponse = await this.paymentProvider.cancelPayment(doc.paymentId, reason);

    await this.repository.update(doc._id.toString(), {
      status: PaymentStatus.CANCELLED,
      failureReason: reason || 'Cancelled by user/system request',
    });

    return {
      paymentId: doc.paymentId,
      orderId: doc.orderId,
      amount: doc.amount,
      currency: doc.currency,
      status: PaymentStatus.CANCELLED,
      provider: doc.provider,
      transactionId: doc.gatewayTransactionId,
      rawGatewayResponse: providerResponse.rawGatewayResponse,
    };
  }

  /**
   * Queries paginated payment records matching criteria.
   *
   * @param filters Criteria filters.
   * @param pagination Page, limit, sortBy, sortOrder options.
   */
  async find(
    filters: PaymentFilters,
    pagination: PaymentPagination
  ): Promise<{
    items: IPayment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.repository.find(filters, pagination);
    return {
      items: result.items.map((doc) => this.mapDocumentToPayment(doc)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Finds a single payment record by system paymentId or _id.
   *
   * @param paymentId System paymentId string.
   */
  async findById(paymentId: string): Promise<IPayment | null> {
    const doc = await this.repository.findByPaymentId(paymentId) || await this.repository.findById(paymentId);
    return doc ? this.mapDocumentToPayment(doc) : null;
  }

  /**
   * Computes aggregate payment statistics metrics.
   *
   * @param filters Optional criteria filters.
   */
  async statistics(filters?: PaymentFilters): Promise<IPaymentStatistics> {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          successCount: {
            $sum: {
              $cond: [
                { $in: ['$status', [PaymentStatus.SUCCESS, PaymentStatus.CAPTURED]] },
                1,
                0,
              ],
            },
          },
          totalRefundedVolume: { $sum: '$refundedAmount' },
          totalRefundsCount: {
            $sum: {
              $cond: [{ $gt: ['$refundedAmount', 0] }, 1, 0],
            },
          },
        },
      },
    ];

    const results = await this.repository.aggregate<Array<{
      totalVolume: number;
      totalCount: number;
      successCount: number;
      totalRefundedVolume: number;
      totalRefundsCount: number;
    }>>(pipeline);

    const stats = results && results.length > 0
      ? results[0]
      : {
          totalVolume: 0,
          totalCount: 0,
          successCount: 0,
          totalRefundedVolume: 0,
          totalRefundsCount: 0,
        };

    const totalCount = (stats as unknown as { totalCount: number }).totalCount || 0;
    const successCount = (stats as unknown as { successCount: number }).successCount || 0;
    const totalVolume = (stats as unknown as { totalVolume: number }).totalVolume || 0;
    const totalRefundsCount = (stats as unknown as { totalRefundsCount: number }).totalRefundsCount || 0;

    const successRate = totalCount > 0 ? parseFloat((successCount / totalCount).toFixed(4)) : 1.0;
    const avgValue = successCount > 0 ? parseFloat((totalVolume / successCount).toFixed(2)) : 0;

    return {
      provider: this.config.provider,
      metrics: {
        totalVolume,
        successRate,
        averageTransactionValue: avgValue,
        totalRefundsCount,
      },
      byStatus: {} as Record<PaymentStatus, number>,
      byMethod: {} as Record<PaymentMethod, number>,
    };
  }
}
