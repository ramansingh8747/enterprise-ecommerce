/**
 * Pagination Metadata Specification Interface (Module 22.1).
 */
export interface IPagination {
  page: number;
  limit: number;
  skip: number;
  totalPages: number;
  totalRecords: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
