import type { IAppRoute, RouteCategory } from './route.types';
import { publicRoutes, authRoutes, customerRoutes, adminRoutes, errorRoutes } from './route.groups';

/**
 * Enterprise Central Route Registry (Module 4 - Step 4.3).
 *
 * Single source of truth for all registered application routes.
 */
export const ROUTE_REGISTRY: readonly IAppRoute[] = Object.freeze([
  ...publicRoutes,
  ...authRoutes,
  ...customerRoutes,
  ...adminRoutes,
  ...errorRoutes,
]);

/**
 * Retrieves all registered application routes.
 */
export function getAllRoutes(): readonly IAppRoute[] {
  return ROUTE_REGISTRY;
}

/**
 * Filters registered routes by category domain.
 */
export function getRoutesByCategory(category: RouteCategory): readonly IAppRoute[] {
  return ROUTE_REGISTRY.filter((r) => r.meta.category === category);
}

/**
 * Finds a registered route by path.
 */
export function getRouteByPath(path: string): IAppRoute | undefined {
  return ROUTE_REGISTRY.find((r) => r.path === path);
}
