import type { ApiTagType } from './api.types';

/**
 * Enterprise RTK Query Constants (Module 6 - Step 6.1).
 *
 * Reducer path and tag type registrations.
 */

export const API_REDUCER_PATH = 'api';

export const API_TAG_TYPES: readonly ApiTagType[] = Object.freeze([
  'Auth',
  'User',
  'Product',
  'Category',
  'Brand',
  'Inventory',
  'Order',
  'Payment',
  'Coupon',
  'Wishlist',
  'Review',
  'Notification',
  'Analytics',
  'AuditLog',
  'Job',
]);
