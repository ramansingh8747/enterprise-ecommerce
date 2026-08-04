import type { RouteCategory } from './route.types';
import type { LayoutType } from '@/layouts/layout.types';

/**
 * Enterprise Extended Route Metadata Contract (Module 4 - Step 4.5).
 *
 * Defines metadata attributes attached to application route definitions.
 */
export interface IExtendedRouteMeta {
  readonly title: string;
  readonly category: RouteCategory;
  readonly description?: string;
  readonly requiresAuth?: boolean;
  readonly guestOnly?: boolean;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
  readonly layout?: LayoutType;
  readonly breadcrumb?: string;
  readonly featureFlag?: string;
  readonly hideInNavigation?: boolean;
}
