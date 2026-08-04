/**
 * Enterprise RTK Query Type Definitions (Module 6 - Step 6.1).
 *
 * Cache tag categories and base query options interfaces.
 */

/** Cache Tag Types supported across RTK Query endpoints. */
export type ApiTagType =
  | 'Auth'
  | 'User'
  | 'Product'
  | 'Category'
  | 'Brand'
  | 'Inventory'
  | 'Order'
  | 'Payment'
  | 'Coupon'
  | 'Wishlist'
  | 'Review'
  | 'Notification'
  | 'Analytics'
  | 'AuditLog'
  | 'Job';

/** Base query configuration options. */
export interface IBaseQueryOptions {
  readonly baseUrl: string;
  readonly timeoutMs: number;
}
