/**
 * API Constants (Module 2 - Step 2.2).
 */

export const DEFAULT_HEADERS = Object.freeze({
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

export const HTTP_TIMEOUTS = Object.freeze({
  DEFAULT: 30000,
  UPLOAD: 120000,
  DOWNLOAD: 60000,
});

export const API_ENDPOINTS = Object.freeze({
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
  },
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  BRANDS: '/brands',
  INVENTORY: '/inventory',
  ORDERS: '/orders',
  PAYMENTS: '/payments',
  COUPONS: '/coupons',
  WISHLIST: '/wishlist',
  REVIEWS: '/reviews',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  AUDIT_LOGS: '/audit-logs',
  BACKGROUND_JOBS: '/jobs',
  FILES: '/files',
  USERS: '/users',
});
