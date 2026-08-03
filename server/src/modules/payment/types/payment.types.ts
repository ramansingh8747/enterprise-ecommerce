import { PaymentMethod, PaymentProvider, PaymentStatus } from '../enums/payment.enums';

export { PaymentMethod, PaymentProvider, PaymentStatus } from '../enums/payment.enums';

/** Backward compatibility type and value aliases for legacy code. */
export type PaymentCurrency = string;
export const PaymentProviderType = PaymentProvider;
export type PaymentProviderType = PaymentProvider;

/**
 * Enterprise Payment Gateway Module — Shared Types (Module 27.1).
 *
 * Core domain query filters, pagination, metrics, context, and summary shapes.
 */

/**
 * Filter options for querying payment records.
 */
export type PaymentFilters = {
  orderId?: string;
  customerId?: string;
  status?: PaymentStatus;
  provider?: PaymentProvider;
  method?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  search?: string;
};

/**
 * Pagination options for payment lists.
 */
export type PaymentPagination = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
};

/**
 * Combined options for payment search requests.
 */
export type PaymentSearchOptions = {
  filters?: PaymentFilters;
  pagination?: PaymentPagination;
};

/**
 * Summary card metrics for payment dashboards.
 */
export type PaymentSummary = {
  totalAmount: number;
  totalCount: number;
  successfulCount: number;
  failedCount: number;
  totalRefunded: number;
};

/**
 * Analytical metrics tracking gateway performance.
 */
export type PaymentMetrics = {
  totalVolume: number;
  successRate: number;
  averageTransactionValue: number;
  totalRefundsCount: number;
};

/**
 * Execution context tracing client requests.
 */
export type PaymentContext = {
  requestId?: string;
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
};
