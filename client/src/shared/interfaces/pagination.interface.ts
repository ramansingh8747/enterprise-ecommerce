import type { SortOrder } from '@/types/api.types';

/**
 * Pagination Query Parameters Interface (Module 2 - Step 2.2).
 */
export interface IPaginationParams {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: SortOrder;
  readonly search?: string;
}

/**
 * Pagination Metadata Interface.
 */
export interface IPaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

/**
 * Paginated Response Envelope Interface.
 */
export interface IPaginatedResponse<T> {
  readonly items: readonly T[];
  readonly meta: IPaginationMeta;
}
