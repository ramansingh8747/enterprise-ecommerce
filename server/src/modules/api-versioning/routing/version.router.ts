import { ApiVersion } from '../enums/api-version.enums';
import { VersionMatcher } from './version.matcher';

/**
 * Version Route Binding Container Interface.
 */
export interface IVersionRouteBinding {
  path: string;
  version: ApiVersion;
  handlerName: string;
}

/**
 * Enterprise Version Router Framework (Module 29.4).
 *
 * Framework-agnostic route metadata registry mapping endpoint paths and API versions
 * to target handler definitions.
 */
export class VersionRouter {
  private readonly routeBindings = new Map<string, IVersionRouteBinding>();

  /**
   * Helper constructing map lookup key string.
   */
  private buildKey(path: string, version: ApiVersion): string {
    return `${version.toLowerCase()}:${path.trim().toLowerCase()}`;
  }

  /**
   * Registers a version route binding.
   *
   * @param path Target URI route path pattern (e.g. '/products').
   * @param version ApiVersion key.
   * @param handlerName Target handler name or controller reference.
   */
  registerVersionRoute(path: string, version: ApiVersion, handlerName: string): void {
    if (!path || !version || !handlerName) {
      throw new Error('Cannot register version route without path, version, and handlerName.');
    }
    const key = this.buildKey(path, version);
    this.routeBindings.set(key, {
      path: path.trim(),
      version,
      handlerName: handlerName.trim(),
    });
  }

  /**
   * Unregisters a version route binding.
   *
   * @param path Route path pattern.
   * @param version ApiVersion key.
   */
  unregisterVersionRoute(path: string, version: ApiVersion): boolean {
    const key = this.buildKey(path, version);
    return this.routeBindings.delete(key);
  }

  /**
   * Resolves a matching version route binding for path and requested version.
   *
   * @param path Target route path pattern.
   * @param version Requested ApiVersion.
   */
  resolveRoute(path: string, version: ApiVersion): IVersionRouteBinding | null {
    const key = this.buildKey(path, version);
    const exact = this.routeBindings.get(key);
    if (exact) return exact;

    // Fallback search across registered routes matching path
    const cleanPath = path.trim().toLowerCase();
    for (const binding of this.routeBindings.values()) {
      if (binding.path.toLowerCase() === cleanPath) {
        if (VersionMatcher.matchExact(version, binding.version)) {
          return binding;
        }
      }
    }

    return null;
  }

  /**
   * Returns list of all registered version route bindings.
   */
  listRoutes(): IVersionRouteBinding[] {
    return Array.from(this.routeBindings.values());
  }

  /**
   * Validates whether a version route exists.
   *
   * @param path Route path.
   * @param version ApiVersion.
   */
  validateRoute(path: string, version: ApiVersion): boolean {
    return this.resolveRoute(path, version) !== null;
  }
}
