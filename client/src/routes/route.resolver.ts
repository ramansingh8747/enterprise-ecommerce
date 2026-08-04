import type { IAppRoute } from './route.types';
import type { LayoutType } from '@/layouts/layout.types';
import { getRouteByPath } from './route.registry';
import { normalizePath, matchPathPattern } from './route.utils';

export interface IResolvedRoute {
  readonly route: IAppRoute;
  readonly layout: LayoutType;
  readonly title: string;
  readonly requiresAuth: boolean;
}

/**
 * Enterprise Route Resolver Engine (Module 4 - Step 4.5).
 *
 * Resolves a requested URL path string into a structured IResolvedRoute envelope.
 */
export class RouteResolver {
  /**
   * Resolves a target path to its registered route configuration and layout type.
   *
   * @param path URL path string.
   */
  public static resolve(path: string): IResolvedRoute | undefined {
    const normalized = normalizePath(path);
    const directMatch = getRouteByPath(normalized);

    if (directMatch) {
      return this.createResolvedEnvelope(directMatch);
    }

    return undefined;
  }

  /**
   * Finds a matching pattern route from a candidate list.
   */
  public static findMatchingRoute(path: string, routes: readonly IAppRoute[]): IAppRoute | undefined {
    const normalized = normalizePath(path);
    return routes.find((r) => matchPathPattern(r.path, normalized));
  }

  private static createResolvedEnvelope(route: IAppRoute): IResolvedRoute {
    return Object.freeze({
      route,
      layout: route.meta.layout || 'public',
      title: route.meta.title,
      requiresAuth: route.meta.requiresAuth ?? false,
    });
  }
}
