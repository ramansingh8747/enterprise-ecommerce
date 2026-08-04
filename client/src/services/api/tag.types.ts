/**
 * Enterprise Cache Tag Type Definitions (Module 6 - Step 6.3).
 *
 * Tag categories and descriptor contracts for RTK Query cache management.
 */

export type ApiTagCategory =
  | 'Auth'
  | 'User'
  | 'Product'
  | 'Category'
  | 'Brand'
  | 'Inventory'
  | 'Order'
  | 'Coupon'
  | 'Wishlist'
  | 'Review'
  | 'Notification'
  | 'Analytics'
  | 'AuditLog'
  | 'Settings';

export interface ITagDescriptor<T extends ApiTagCategory = ApiTagCategory> {
  readonly type: T;
  readonly id?: string | number;
}
