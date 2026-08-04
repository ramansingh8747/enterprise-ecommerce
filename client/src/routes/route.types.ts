import type { ComponentType, ReactNode } from 'react';
import type { LayoutType } from '@/layouts/layout.types';

/**
 * Enterprise Routing Type Definitions (Module 4 - Step 4.5).
 *
 * Strongly typed contracts for application routes, metadata, category permissions, and navigation items.
 */

/** High-level routing domain categories. */
export type RouteCategory = 'public' | 'auth' | 'customer' | 'admin' | 'error';

/** Access control permission requirements for protected routes. */
export interface IRouteMeta {
  readonly title: string;
  readonly category: RouteCategory;
  readonly requiresAuth?: boolean;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
  readonly layout?: LayoutType;
  readonly icon?: string;
  readonly hideInNavigation?: boolean;
}

/** Standard application route contract. */
export interface IAppRoute {
  readonly path: string;
  readonly component?: ComponentType<unknown>;
  readonly element?: ReactNode;
  readonly meta: IRouteMeta;
  readonly children?: readonly IAppRoute[];
}

/** Comprehensive route definition tuple. */
export interface IRouteDefinition {
  readonly id: string;
  readonly route: IAppRoute;
}
