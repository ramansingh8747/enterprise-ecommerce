import type { AppMiddleware } from '../types/middleware.types';

/**
 * Enterprise Action Logger Middleware Placeholder (Module 5 - Step 5.4).
 *
 * Logs dispatched Redux actions and next state in development mode.
 */
export const loggerMiddleware: AppMiddleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  if (import.meta.env.DEV) {
    // Action logger placeholder
    storeApi.getState();
  }
  return result;
};
