import { ISearchRepository } from '../interfaces/search-repository.interface';
import { ISearchFilters } from '../interfaces/search-filters.interface';
import { ISearchResponse } from '../interfaces/search-response.interface';
import { IPagination } from '../interfaces/pagination.interface';
import { SortField, SortDirection } from '../types/search.types';
import { QueryTransformerUtil } from '../utils/query-transformer.util';
import { PaginationHelper } from '../utils/pagination.helper';
import { DEFAULT_SORT, DEFAULT_ORDER } from '../constants/search.constants';

/**
 * Enterprise Search Application Service Implementation (Module 22.5).
 * Orchestrates business filter normalization and delegates database queries to ISearchRepository.
 */
export class SearchService {
  constructor(private readonly searchRepository: ISearchRepository) {}

  /**
   * Orchestrates product search workflow against SearchRepository.
   */
  async searchProducts(filters: ISearchFilters): Promise<ISearchResponse> {
    return this.searchRepository.search(filters);
  }

  /**
   * Builds normalized filter criteria object from raw payload.
   */
  buildFilters(rawFilters: any): ISearchFilters {
    return QueryTransformerUtil.transform(rawFilters);
  }

  /**
   * Builds sorting parameters.
   */
  buildSorting(sortBy?: SortField, sortOrder?: SortDirection): { field: SortField; order: SortDirection } {
    return {
      field: sortBy || DEFAULT_SORT,
      order: sortOrder || DEFAULT_ORDER,
    };
  }

  /**
   * Builds pagination structure parameters.
   */
  buildPagination(page?: number, limit?: number): Partial<IPagination> {
    return PaginationHelper.calculatePagination(page, limit, 0);
  }
}
