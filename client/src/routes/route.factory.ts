import type { IAppRoute, IRouteMeta } from './route.types';
import { normalizePath } from './route.utils';

/**
 * Enterprise Route Factory (Module 4 - Step 4.5).
 *
 * Factory helper responsible for instantiating strongly typed, validated IAppRoute objects.
 */
export class RouteFactory {
  /**
   * Creates a normalized, immutable IAppRoute object.
   *
   * @param path Target URL path segment.
   * @param meta Route metadata configuration.
   * @param children Optional nested child routes.
   */
  public static createRoute(
    path: string,
    meta: IRouteMeta,
    children?: readonly IAppRoute[]
  ): IAppRoute {
    const routeObj: IAppRoute = {
      path: normalizePath(path),
      meta: Object.freeze({ ...meta }),
      ...(children && children.length > 0 ? { children: Object.freeze([...children]) } : {}),
    };

    return Object.freeze(routeObj);
  }
}
