import type { IApiError, IApiErrorDetail } from '@/shared/interfaces/api.interface';

/**
 * Enterprise Error Helper Functions (Module 2 - Step 2.3).
 *
 * Pure utility functions for normalizing API errors, extracting field validation messages,
 * and generating human-readable error messages.
 */

/**
 * Type guard checking if an error object conforms to IApiError interface.
 */
export function isApiError(error: unknown): error is IApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Safely extracts a human-readable message string from any error object.
 *
 * @param error Unknown error payload.
 * @param defaultMessage Fallback message if extraction fails.
 */
export function formatErrorMessage(error: unknown, defaultMessage = 'An unexpected error occurred.'): string {
  if (typeof error === 'string') {
    return error;
  }

  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as Record<string, unknown>).message);
  }

  return defaultMessage;
}

/**
 * Converts array of IApiErrorDetail items into a key-value dictionary { [field]: message }.
 *
 * @param details Array of field validation error details.
 */
export function extractValidationErrors(details?: readonly IApiErrorDetail[]): Record<string, string> {
  if (!details || !Array.isArray(details)) {
    return {};
  }

  return details.reduce<Record<string, string>>((acc, err) => {
    if (err.field && err.message) {
      acc[err.field] = err.message;
    }
    return acc;
  }, {});
}
