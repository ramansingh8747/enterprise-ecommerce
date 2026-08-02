import { ISearchResponse } from '../interfaces/search-response.interface';
import { ISearchFilters } from '../interfaces/search-filters.interface';
import { IPagination } from '../interfaces/pagination.interface';
import { SortField, SortDirection } from '../types/search.types';

/**
 * Search Response Envelope Builder Placeholder (Module 22.1 Architecture Only).
 */
export class SearchResponseBuilder {
  /**
   * Constructs standardized ISearchResponse envelope.
   */
  static buildResponse<T = unknown>(
    _products: T[],
    _pagination: IPagination,
    _filtersApplied: Partial<ISearchFilters>,
    _sort: { field: SortField; order: SortDirection },
    _startTime: number,
    _totalResults: number
  ): ISearchResponse<T> {
    throw new Error('SearchResponseBuilder.buildResponse method placeholder.');
  }

  /**
   * Calculates execution duration in milliseconds.
   */
  static calculateExecutionTime(_startTime: number): number {
    throw new Error('SearchResponseBuilder.calculateExecutionTime method placeholder.');
  }
}
