import { ISearchResponse } from '../interfaces/search-response.interface';
import { IPagination } from '../interfaces/pagination.interface';
import { ISearchFilters } from '../interfaces/search-filters.interface';
import { SortField, SortDirection } from '../types/search.types';

/**
 * Outgoing Search Response DTO Specification (Module 22.1).
 */
export interface SearchResponseDto<T = unknown> extends ISearchResponse<T> {
  products: T[];
  pagination: IPagination;
  filtersApplied: Partial<ISearchFilters>;
  sort: {
    field: SortField;
    order: SortDirection;
  };
  executionTime: number;
  totalResults: number;
}
