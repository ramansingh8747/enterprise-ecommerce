import type { RouteCategory } from './route.types';

/**
 * Enterprise Routing Category Constants (Module 4 - Step 4.1).
 *
 * Centralized constant definitions for route domain categories.
 */
export const ROUTE_CATEGORIES = Object.freeze({
  PUBLIC: 'public' as RouteCategory,
  AUTH: 'auth' as RouteCategory,
  CUSTOMER: 'customer' as RouteCategory,
  ADMIN: 'admin' as RouteCategory,
  ERROR: 'error' as RouteCategory,
});

export const ROUTE_PREFIXES = Object.freeze({
  AUTH: '/auth',
  ADMIN: '/admin',
  CUSTOMER: '/account',
  API: '/api/v1',
});
