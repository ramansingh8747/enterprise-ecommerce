import { ApiVersion } from '../enums/api-version.enums';

/**
 * Enterprise API Version Decorator Utility Helpers (Module 29.4).
 *
 * Provides metadata resolution and version annotation helper methods for route handlers.
 */
export class ApiVersionDecoratorUtil {
  /**
   * Predicate determining whether an incoming request object should undergo version resolution.
   *
   * @param req Request or request payload object.
   */
  static shouldResolveVersion(req?: { path?: string }): boolean {
    if (!req) return true;
    // Skip health check or upload binary paths
    if (req.path === '/health' || req.path?.startsWith('/uploads/')) {
      return false;
    }
    return true;
  }

  /**
   * Formats route metadata annotation payload.
   *
   * @param path Target route URI path.
   * @param version ApiVersion enum.
   */
  static resolveRouteMetadata(path: string, version: ApiVersion): Record<string, unknown> {
    return {
      path,
      targetVersion: version,
      annotatedAt: new Date().toISOString(),
    };
  }

  /**
   * Formats structured API version metadata.
   *
   * @param version ApiVersion enum.
   * @param status Version status string.
   */
  static buildVersionMetadata(version: ApiVersion, status: string = 'ACTIVE'): Record<string, unknown> {
    return {
      version,
      status,
      timestamp: new Date().toISOString(),
    };
  }
}
