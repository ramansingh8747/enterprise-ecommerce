import { SortField, SortDirection } from '../types/search.types';
import { DEFAULT_SORT, DEFAULT_ORDER } from '../constants/search.constants';

/**
 * Sorting Helper Utility (Module 22.3).
 */
export class SortingHelper {
  /**
   * Builds Mongoose sort criteria object.
   */
  static buildSortOptions(
    sortBy?: SortField,
    sortOrder?: SortDirection
  ): Record<string, 1 | -1> {
    const field = sortBy || DEFAULT_SORT;
    const order = (sortOrder || DEFAULT_ORDER).toUpperCase() === 'ASC' ? 1 : -1;

    // Field mapping
    switch (field) {
      case 'price':
        return { price: order };
      case 'rating':
        return { averageRating: order };
      case 'popularity':
        return { reviewCount: order, createdAt: -1 };
      case 'name':
        return { name: order };
      case 'updatedAt':
        return { updatedAt: order };
      case 'createdAt':
      default:
        return { createdAt: order };
    }
  }

  /**
   * Validates sort field parameter.
   */
  static validateSortField(field?: string): boolean {
    if (!field) return false;
    return ['price', 'createdAt', 'updatedAt', 'rating', 'popularity', 'name'].includes(field);
  }
}
