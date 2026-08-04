import type { ApiTagCategory } from './tag.types';

/**
 * Enterprise Cache Tag Constants (Module 6 - Step 6.3).
 *
 * Centralized list of supported RTK Query cache tag categories.
 */
export const TAG_CATEGORIES: readonly ApiTagCategory[] = Object.freeze([
  'Auth',
  'User',
  'Product',
  'Category',
  'Brand',
  'Inventory',
  'Order',
  'Coupon',
  'Wishlist',
  'Review',
  'Notification',
  'Analytics',
  'AuditLog',
  'Settings',
]);
