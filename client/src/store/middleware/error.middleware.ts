import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { AppMiddleware } from '../types/middleware.types';

/**
 * Enterprise Global Error Handling Middleware Placeholder (Module 5 - Step 5.4).
 *
 * Intercepts rejected thunks and RTK Query errors for global notification toasts.
 */
export const errorMiddleware: AppMiddleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    // Global error dispatch placeholder
  }
  return next(action);
};
