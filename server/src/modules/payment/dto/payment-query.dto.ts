import { PaymentMethod, PaymentProvider, PaymentStatus, PaymentType } from '../enums/payment.enums';

/**
 * Payment Query Request DTO (Module 27.5).
 *
 * Query parameters for paginated payment list retrieval.
 */
export interface PaymentQueryDto {
  page?: string;
  limit?: string;
  provider?: PaymentProvider;
  paymentMethod?: PaymentMethod;
  paymentType?: PaymentType;
  status?: PaymentStatus;
  userId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}
