import type { ApiErrorType } from './error.types';

/**
 * Enterprise API Error Constants (Module 6 - Step 6.4).
 *
 * Error category mapping and default fallback messages.
 */

export const API_ERROR_TYPES = Object.freeze({
  VALIDATION: 'validation' as ApiErrorType,
  NETWORK: 'network' as ApiErrorType,
  UNAUTHORIZED: 'unauthorized' as ApiErrorType,
  FORBIDDEN: 'forbidden' as ApiErrorType,
  NOT_FOUND: 'notFound' as ApiErrorType,
  SERVER: 'server' as ApiErrorType,
  UNKNOWN: 'unknown' as ApiErrorType,
});

export const DEFAULT_ERROR_MESSAGES = Object.freeze({
  NETWORK: 'Network communication failure. Please check your internet connection.',
  UNAUTHORIZED: 'Session expired or unauthorized access.',
  FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource could not be found.',
  SERVER: 'An internal server error occurred. Please try again later.',
  UNKNOWN: 'An unexpected error occurred.',
});
