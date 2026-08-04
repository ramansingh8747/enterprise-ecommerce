/**
 * Enterprise Application Route Path Constants (Module 2 - Step 2.1).
 *
 * Centralized constant paths for all application features and pages.
 * Eliminates magic route strings throughout components and services.
 */
export const ROUTES = Object.freeze({
  HOME: '/',
  DASHBOARD: '/dashboard',
  TABLE_DEMO: '/demo/table',
  AUTH: Object.freeze({
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  }),
  PRODUCTS: Object.freeze({
    LIST: '/products',
    DETAILS: (id: string = ':id') => `/products/${id}`,
    CREATE: '/products/new',
    EDIT: (id: string = ':id') => `/products/${id}/edit`,
  }),
  CATEGORIES: Object.freeze({
    LIST: '/categories',
    DETAILS: (id: string = ':id') => `/categories/${id}`,
  }),
  BRANDS: Object.freeze({
    LIST: '/brands',
    DETAILS: (id: string = ':id') => `/brands/${id}`,
  }),
  ORDERS: Object.freeze({
    LIST: '/orders',
    DETAILS: (id: string = ':id') => `/orders/${id}`,
    CHECKOUT: '/orders/checkout',
  }),
  PAYMENTS: Object.freeze({
    HISTORY: '/payments/history',
    DETAILS: (id: string = ':id') => `/payments/${id}`,
  }),
  COUPONS: Object.freeze({
    LIST: '/coupons',
  }),
  WISHLIST: '/wishlist',
  REVIEWS: '/reviews',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  AUDIT_LOGS: '/audit-logs',
  BACKGROUND_JOBS: '/jobs',
  SETTINGS: '/settings',
  USERS: Object.freeze({
    PROFILE: '/users/profile',
    MANAGEMENT: '/users/manage',
    DETAILS: (id: string = ':id') => `/users/${id}`,
  }),
  ERRORS: Object.freeze({
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/401',
    FORBIDDEN: '/403',
    SERVER_ERROR: '/500',
  }),
});
