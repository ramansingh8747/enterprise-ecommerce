import { IPaymentDocument } from '../models/payment.model';
import { PaymentFilters, PaymentPagination } from '../types/payment.types';

/**
 * Enterprise Payment Repository Contract (Module 27.2).
 *
 * Pluggable repository boundary defining data access contracts for payment persistence.
 * Implements Dependency Inversion Principle.
 */
export interface IPaymentRepository {
  /**
   * Creates and persists a new payment transaction record.
   *
   * @param data Initial payment document parameters.
   */
  create(data: Partial<IPaymentDocument>): Promise<IPaymentDocument>;

  /**
   * Bulk creates multiple payment transaction records.
   *
   * @param data Array of initial payment document parameters.
   */
  createMany(data: Array<Partial<IPaymentDocument>>): Promise<IPaymentDocument[]>;

  /**
   * Updates an existing payment transaction record by MongoDB _id or paymentId.
   *
   * @param id MongoDB Object ID string or paymentId.
   * @param update Partial update fields.
   */
  update(id: string, update: Partial<IPaymentDocument>): Promise<IPaymentDocument | null>;

  /**
   * Queries paginated payment records matching filters and sorting parameters.
   *
   * @param filters Criteria filters (orderId, customerId, status, etc.).
   * @param pagination Page, limit, sortBy, sortOrder options.
   */
  find(
    filters: PaymentFilters,
    pagination: PaymentPagination
  ): Promise<{
    items: IPaymentDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Retrieves a single payment record by MongoDB _id.
   *
   * @param id Target MongoDB Object ID string.
   */
  findById(id: string): Promise<IPaymentDocument | null>;

  /**
   * Retrieves a single payment record by system paymentId (e.g. 'pay_18c5e2a9_4f8b2c1d').
   *
   * @param paymentId Unique paymentId string.
   */
  findByPaymentId(paymentId: string): Promise<IPaymentDocument | null>;

  /**
   * Executes custom MongoDB aggregation pipelines for analytical statistics.
   *
   * @param pipeline Array of aggregation pipeline stage objects.
   */
  aggregate<T = unknown>(pipeline: unknown[]): Promise<T[]>;

  /**
   * Counts total payment records matching optional criteria filters.
   *
   * @param filters Criteria filters.
   */
  count(filters?: PaymentFilters): Promise<number>;

  /**
   * Purges expired or abandoned payment records older than cutoff date.
   *
   * @param olderThan Cutoff Date threshold.
   */
  cleanup(olderThan: Date): Promise<number>;
}
