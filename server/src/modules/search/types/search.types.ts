/**
 * Enterprise Search Engine Domain Types & Enums (Module 22.1).
 */

/**
 * Allowed sortable product fields for search queries.
 */
export type SortField = 'price' | 'createdAt' | 'updatedAt' | 'rating' | 'popularity' | 'name';

/**
 * Sort direction / order.
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * Product inventory stock status classifications.
 */
export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  BACKORDER = 'BACKORDER',
  LOW_STOCK = 'LOW_STOCK',
}

/**
 * Product availability status classifications.
 */
export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  PREORDER = 'PREORDER',
  DISCONTINUED = 'DISCONTINUED',
}
