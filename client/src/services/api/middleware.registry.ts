import type { Middleware } from '@reduxjs/toolkit';

/**
 * Open/Closed API Middleware Registry (Module 6 - Step 6.5).
 *
 * Centralized registry for registering custom RTK Query API middlewares.
 */
export class ApiMiddlewareRegistry {
  private static middlewares: Middleware[] = [];

  /**
   * Registers a custom RTK Query API middleware.
   */
  public static register(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Gets all registered API middlewares.
   */
  public static getMiddlewares(): readonly Middleware[] {
    return Object.freeze([...this.middlewares]);
  }
}
