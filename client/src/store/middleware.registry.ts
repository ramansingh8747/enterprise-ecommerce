import type { AppMiddleware } from './types/middleware.types';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { baseApi } from '@/services/api/baseApi';

/**
 * Open/Closed Middleware Registry (Module 5 - Step 5.5).
 *
 * Allows future feature modules to register custom store middlewares dynamically.
 */
export class MiddlewareRegistry {
  private static middlewares: AppMiddleware[] = [
    loggerMiddleware,
    errorMiddleware,
    baseApi.middleware as AppMiddleware,
  ];

  /**
   * Registers a custom feature middleware.
   */
  public static register(middleware: AppMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Gets the array of registered middlewares.
   */
  public static getMiddlewares(): readonly AppMiddleware[] {
    return Object.freeze([...this.middlewares]);
  }
}

