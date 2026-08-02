import { ISearchRepository } from '../interfaces/search-repository.interface';
import { ISearchFilters } from '../interfaces/search-filters.interface';
import { ISearchResponse } from '../interfaces/search-response.interface';
import { IProduct } from '../../../interfaces/product.interface';
import Product from '../../../models/product.model';
import { SearchQueryBuilder } from '../builders/search-query.builder';
import { SortingHelper } from '../utils/sorting.helper';
import { PaginationHelper } from '../utils/pagination.helper';
import { SearchRepositoryError } from '../errors/search.errors';
import { DEFAULT_SORT, DEFAULT_ORDER } from '../constants/search.constants';

/**
 * Enterprise Search Repository Implementation (Module 22.3).
 * Executes lean, projection-optimized MongoDB search queries using SearchQueryBuilder.
 */
export class SearchRepository implements ISearchRepository {
  /**
   * Field projection string for search results to avoid loading full descriptions unless needed.
   */
  private static readonly SEARCH_PROJECTION =
    'name slug sku shortDescription price comparePrice currency quantity category brand images thumbnail tags status stockStatus isFeatured isDigital createdAt updatedAt averageRating reviewCount';

  /**
   * Executes product search query against MongoDB with lean projection, sorting, skip, and limit.
   */
  async findProducts(
    filter: Record<string, any>,
    sortOptions: Record<string, 1 | -1>,
    skip: number,
    limit: number
  ): Promise<IProduct[]> {
    try {
      return await Product.find(filter)
        .select(SearchRepository.SEARCH_PROJECTION)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean<IProduct[]>();
    } catch (error: any) {
      throw new SearchRepositoryError(`Failed to execute findProducts query: ${error.message}`, error);
    }
  }

  /**
   * Counts total matching product documents.
   */
  async countProducts(filter: Record<string, any>): Promise<number> {
    try {
      return await Product.countDocuments(filter);
    } catch (error: any) {
      throw new SearchRepositoryError(`Failed to execute countProducts query: ${error.message}`, error);
    }
  }

  /**
   * Checks if at least one matching product document exists.
   */
  async exists(filter: Record<string, any>): Promise<boolean> {
    try {
      const result = await Product.exists(filter);
      return !!result;
    } catch (error: any) {
      throw new SearchRepositoryError(`Failed to execute exists query: ${error.message}`, error);
    }
  }

  /**
   * Orchestrates complete search database retrieval.
   */
  async search(filters: ISearchFilters): Promise<ISearchResponse> {
    const startTime = Date.now();

    try {
      const filterObj = SearchQueryBuilder.build(filters);
      const sortObj = SortingHelper.buildSortOptions(filters.sortBy, filters.sortOrder);
      const pagination = PaginationHelper.calculatePagination(filters.page, filters.limit, 0);

      const [products, totalRecords] = await Promise.all([
        this.findProducts(filterObj, sortObj, pagination.skip, pagination.limit),
        this.countProducts(filterObj),
      ]);

      const finalPagination = PaginationHelper.calculatePagination(
        filters.page,
        filters.limit,
        totalRecords
      );
      const executionTime = Date.now() - startTime;

      return {
        products,
        pagination: finalPagination,
        filtersApplied: filters,
        sort: {
          field: filters.sortBy || DEFAULT_SORT,
          order: filters.sortOrder || DEFAULT_ORDER,
        },
        executionTime,
        totalResults: totalRecords,
      };
    } catch (error: any) {
      if (error instanceof SearchRepositoryError) {
        throw error;
      }
      throw new SearchRepositoryError(`Failed to execute search: ${error.message}`, error);
    }
  }
}
