import type { IApiResponse } from '@/shared/interfaces/api.interface';

/**
 * Enterprise API Response Helper Functions (Module 2 - Step 2.3).
 *
 * Helpers for unwrapping IApiResponse envelopes and verifying success status.
 */

/**
 * Checks whether an API response envelope represents a successful operation.
 *
 * @param response Candidate response envelope.
 */
export function isSuccessResponse<T>(response: unknown): response is IApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as IApiResponse<T>).success === true
  );
}

/**
 * Extracts data payload T from an IApiResponse envelope.
 *
 * @param response IApiResponse envelope.
 * @param fallback Optional fallback value if data is undefined.
 */
export function extractResponseData<T>(response: unknown, fallback?: T): T | undefined {
  if (isSuccessResponse<T>(response) && response.data !== undefined) {
    return response.data;
  }
  return fallback;
}
