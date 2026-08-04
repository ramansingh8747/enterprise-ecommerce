import { MiddlewareRegistry } from './middleware.registry';

/**
 * Custom Enterprise Middleware Array (Module 5 - Step 5.5).
 *
 * Dynamically collects custom middlewares from MiddlewareRegistry.
 */
export const customMiddlewares = MiddlewareRegistry.getMiddlewares();

export default customMiddlewares;
