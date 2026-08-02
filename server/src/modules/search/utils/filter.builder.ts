import { ISearchFilters } from '../interfaces/search-filters.interface';
import { SearchQueryBuilder } from '../builders/search-query.builder';

/**
 * Filter Criteria Builder Utility (Module 22.2).
 * Delegator wrapper calling pure SearchQueryBuilder functions.
 */
export class FilterBuilder {
  /**
   * Translates application filters to raw database criteria object.
   */
  static buildQueryFilters(filters: ISearchFilters): Record<string, any> {
    return SearchQueryBuilder.build(filters);
  }

  /**
   * Builds category filter criteria.
   */
  static buildCategoryFilter(category?: string | string[]): Record<string, any> {
    return SearchQueryBuilder.buildCategory(category);
  }

  /**
   * Builds price range filter criteria.
   */
  static buildPriceRangeFilter(minPrice?: number, maxPrice?: number): Record<string, any> {
    return SearchQueryBuilder.buildPriceRange(minPrice, maxPrice);
  }
}
