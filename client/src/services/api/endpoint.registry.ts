import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';

export type EndpointInjector = (
  builder: EndpointBuilder<BaseQueryFn, string, string>
) => Record<string, unknown>;

/**
 * Open/Closed Endpoint Registry (Module 6 - Step 6.5).
 *
 * Enables future feature modules (auth, products, orders) to register RTK Query endpoints dynamically
 * without modifying baseApi.ts.
 */
export class EndpointRegistry {
  private static injectors: Map<string, EndpointInjector> = new Map();

  /**
   * Registers a feature endpoint injector.
   */
  public static register(name: string, injector: EndpointInjector): void {
    this.injectors.set(name, injector);
  }

  /**
   * Gets all registered endpoint injectors.
   */
  public static getInjectors(): ReadonlyMap<string, EndpointInjector> {
    return this.injectors;
  }
}
