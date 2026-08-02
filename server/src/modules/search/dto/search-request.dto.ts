import { SortField, SortDirection, StockStatus, AvailabilityStatus } from '../types/search.types';

/**
 * Incoming Search Request DTO Interface (Module 22.1).
 */
export interface SearchRequestDto {
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
