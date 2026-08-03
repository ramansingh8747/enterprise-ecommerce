import { Request, Response, NextFunction } from 'express';
import { IPaymentService, IPaymentStatistics } from '../interfaces/payment.interfaces';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { IPayment, IPaymentRefund, IPaymentResponse } from '../interfaces/payment.interfaces';
import { PaymentContext, PaymentFilters, PaymentPagination } from '../types/payment.types';
import { PaymentMethod, PaymentProvider, PaymentStatus, PaymentType } from '../enums/payment.enums';

/**
 * Enterprise Payment Controller (Module 27.5).
 *
 * Thin HTTP adapter exposing Payment REST API endpoints.
 * Responsibilities:
 * 1. Read validated request parameters/body/query parameters.
 * 2. Delegate execution strictly to IPaymentService.
 * 3. Return standardized ApiResponse envelopes.
 * 4. Forward unhandled errors to Express next(error) middleware.
 *
 * Contains ZERO business logic.
 */
export class PaymentController {
  constructor(private readonly paymentService: IPaymentService) {}

  /**
   * Helper extracting string query parameter safely.
   */
  private qs(req: Request, key: string): string | undefined {
    const raw = req.query[key];
    if (raw === undefined || raw === null) return undefined;
    const value = String(raw).trim();
    return value.length > 0 ? value : undefined;
  }

  /**
   * POST /api/v1/payments
   * Initiates a new payment transaction.
   */
  async createPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, amount, currency, provider, paymentMethod, paymentType, metadata } = req.body;
      const user = (req as Request & { user?: { id?: string; _id?: string } }).user;
      const customerId = user?.id || user?._id || 'guest_customer';

      const context: PaymentContext = {
        requestId: req.headers['x-request-id'] as string,
        correlationId: req.headers['x-correlation-id'] as string,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        userId: customerId,
      };

      const responseData: IPaymentResponse = await this.paymentService.create(
        {
          orderId,
          customerId,
          amount,
          currency,
          provider,
          method: paymentMethod,
          type: paymentType,
          metadata,
        },
        context
      );

      const response: ApiResponse<IPaymentResponse> = {
        success: true,
        message: 'Payment transaction initiated successfully.',
        data: responseData,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/payments/capture
   * Captures an authorized payment transaction.
   */
  async capturePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId, amount } = req.body;
      const responseData: IPaymentResponse = await this.paymentService.capture(paymentId, amount);

      const response: ApiResponse<IPaymentResponse> = {
        success: true,
        message: 'Payment captured successfully.',
        data: responseData,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/payments/refund
   * Refunds a completed payment transaction.
   */
  async refundPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId, amount, reason } = req.body;
      const refundData: IPaymentRefund = await this.paymentService.refund(paymentId, amount, reason);

      const response: ApiResponse<IPaymentRefund> = {
        success: true,
        message: 'Payment refund processed successfully.',
        data: refundData,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/payments/cancel
   * Cancels a pending or authorized payment transaction.
   */
  async cancelPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId, reason } = req.body;
      const responseData: IPaymentResponse = await this.paymentService.cancel(paymentId, reason);

      const response: ApiResponse<IPaymentResponse> = {
        success: true,
        message: 'Payment cancelled successfully.',
        data: responseData,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/payments
   * Retrieves paginated payment transactions matching filters and sorting.
   */
  async getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
      const sortBy = this.qs(req, 'sortBy') || 'createdAt';
      const sortOrder = req.query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

      const pagination: PaymentPagination = { page, limit, sortBy, sortOrder };

      const filters: PaymentFilters = {
        provider: this.qs(req, 'provider') as PaymentProvider | undefined,
        method: this.qs(req, 'paymentMethod') as PaymentMethod | undefined,
        status: this.qs(req, 'status') as PaymentStatus | undefined,
        customerId: this.qs(req, 'userId'),
        orderId: this.qs(req, 'orderId'),
        startDate: this.qs(req, 'startDate') ? new Date(this.qs(req, 'startDate')!) : undefined,
        endDate: this.qs(req, 'endDate') ? new Date(this.qs(req, 'endDate')!) : undefined,
        search: this.qs(req, 'search'),
      };

      const result = await this.paymentService.find(filters, pagination);

      const response: ApiResponse<{
        items: IPayment[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }> = {
        success: true,
        message: 'Payments retrieved successfully.',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/payments/statistics
   * Returns analytical payment statistics.
   */
  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: PaymentFilters = {
        startDate: this.qs(req, 'startDate') ? new Date(this.qs(req, 'startDate')!) : undefined,
        endDate: this.qs(req, 'endDate') ? new Date(this.qs(req, 'endDate')!) : undefined,
        provider: this.qs(req, 'provider') as PaymentProvider | undefined,
      };

      const stats: IPaymentStatistics = await this.paymentService.statistics(filters);

      const response: ApiResponse<IPaymentStatistics> = {
        success: true,
        message: 'Payment statistics computed successfully.',
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/payments/:id
   * Retrieves a single payment record by system paymentId or ID.
   */
  async getPaymentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const payment = await this.paymentService.findById(id);

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Payment record not found.',
        });
        return;
      }

      const response: ApiResponse<IPayment> = {
        success: true,
        message: 'Payment record retrieved successfully.',
        data: payment,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
