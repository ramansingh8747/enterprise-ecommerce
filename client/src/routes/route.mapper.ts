import type { IAppRoute } from './route.types';
import { ROUTE_REGISTRY } from './route.registry';

/**
 * Enterprise Route Mapper (Module 4 - Step 4.5).
 *
 * Transforms route registry entries into indexed lookup maps.
 */
export class RouteMapper {
  /**
   * Generates a key-value dictionary mapping route paths to IAppRoute objects.
   */
  public static toPathMap(routes: readonly IAppRoute[] = ROUTE_REGISTRY): Map<string, IAppRoute> {
    const map = new Map<string, IAppRoute>();
    for (const route of routes) {
      map.set(route.path, route);
    }
    return map;
  }

  /**
   * Flattens a nested route tree into a flat array of IAppRoute items.
   */
  public static flattenRoutes(routes: readonly IAppRoute[]): IAppRoute[] {
    const result: IAppRoute[] = [];

    const traverse = (items: readonly IAppRoute[]) => {
      for (const item of items) {
        result.push(item);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      }
    };

    traverse(routes);
    return result;
  }
}
