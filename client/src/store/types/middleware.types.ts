import type { Middleware } from '@reduxjs/toolkit';

/**
 * Middleware Type Definitions (Module 5 - Step 5.5).
 */

/** Typed Redux Middleware contract for the application store. */
export type AppMiddleware = Middleware;

/** Options contract for initializing store middlewares. */
export interface IMiddlewareOptions {
  readonly enableLogging?: boolean;
  readonly enableAnalytics?: boolean;
}
