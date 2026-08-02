import { IPagination } from '../interfaces/pagination.interface';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../constants/search.constants';

/**
 * Pagination Calculation Utility (Module 22.3).
 */
export class PaginationHelper {
  /**
   * Calculates pagination metadata structure.
   */
  static calculatePagination(
    page?: number,
    limit?: number,
    totalRecords: number = 0
  ): IPagination {
    const validPage = Math.max(1, page || DEFAULT_PAGE);
    const validLimit = Math.min(MAX_LIMIT, Math.max(1, limit || DEFAULT_LIMIT));
    const skip = (validPage - 1) * validLimit;
    const totalPages = Math.ceil(totalRecords / validLimit) || 1;

    return {
      page: validPage,
      limit: validLimit,
      skip,
      totalPages,
      totalRecords,
      hasNextPage: validPage < totalPages,
      hasPreviousPage: validPage > 1,
    };
  }

  /**
   * Calculates skip offset for database query limit.
   */
  static calculateSkip(page?: number, limit?: number): number {
    const validPage = Math.max(1, page || DEFAULT_PAGE);
    const validLimit = Math.min(MAX_LIMIT, Math.max(1, limit || DEFAULT_LIMIT));
    return (validPage - 1) * validLimit;
  }
}
