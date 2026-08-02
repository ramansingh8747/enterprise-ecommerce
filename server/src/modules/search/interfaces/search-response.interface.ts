import { IPagination } from './pagination.interface';
import { ISearchFilters } from './search-filters.interface';
import { SortField, SortDirection } from '../types/search.types';

/**
 * Enterprise Search Engine Response Envelope Interface Specification (Module 22.1).
 */
export interface ISearchResponse<T = unknown> {
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
