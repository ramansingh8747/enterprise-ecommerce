import { SortField, SortDirection, StockStatus, AvailabilityStatus } from '../types/search.types';

/**
 * Enterprise Search & Filter Parameters Interface Specification (Module 22.1).
 */
export interface ISearchFilters {
  keyword?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  stockStatus?: StockStatus;
  availability?: AvailabilityStatus;
  tags?: string[];
  attributes?: Record<string, string | string[]>;
  sortBy?: SortField;
  sortOrder?: SortDirection;
  page?: number;
  limit?: number;
}
