import { ISearchFilters } from './search-filters.interface';
import { ISearchResponse } from './search-response.interface';
import { IProduct } from '../../../interfaces/product.interface';

/**
 * Enterprise Search Repository Boundary Interface (Module 22.3 Clean Architecture).
 */
export interface ISearchRepository {
  /**
   * Executes lean, projection-optimized Product document query against database.
   */
  findProducts(
    filter: Record<string, any>,
    sortOptions: Record<string, 1 | -1>,
    skip: number,
    limit: number
  ): Promise<IProduct[]>;

  /**
   * Returns total matching document count for the filter criteria.
   */
  countProducts(filter: Record<string, any>): Promise<number>;

  /**
   * Checks whether at least one product document matches the filter criteria.
   */
  exists(filter: Record<string, any>): Promise<boolean>;

  /**
   * Orchestrates high-level search execution against Product model.
   */
  search(filters: ISearchFilters): Promise<ISearchResponse>;
}
