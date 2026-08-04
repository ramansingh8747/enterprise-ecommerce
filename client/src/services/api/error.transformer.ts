import type { INormalizedApiError, ApiErrorType } from './error.types';
import { API_ERROR_TYPES, DEFAULT_ERROR_MESSAGES } from './error.constants';
import { isApiError } from '@/shared/helpers/error.helper';

/**
 * Enterprise API Error Transformer Engine (Module 6 - Step 6.4).
 *
 * Normalizes raw HTTP errors, fetch failures, and backend error payloads into an INormalizedApiError envelope.
 */
export class ApiErrorTransformer {
  /**
   * Normalizes an unknown error into a structured INormalizedApiError object.
   */
  public static transform(rawError: unknown): INormalizedApiError {
    if (isApiError(rawError)) {
      const errorObj: INormalizedApiError = {
        type: this.categorizeStatus(rawError.statusCode),
        statusCode: rawError.statusCode,
        message: rawError.message || DEFAULT_ERROR_MESSAGES.UNKNOWN,
        ...(rawError.errors && rawError.errors.length > 0
          ? { details: Object.freeze([...rawError.errors]) }
          : {}),
        ...(rawError.timestamp ? { timestamp: rawError.timestamp } : {}),
      };
      return Object.freeze(errorObj);
    }

    if (rawError instanceof Error) {
      return Object.freeze({
        type: API_ERROR_TYPES.UNKNOWN,
        statusCode: 0,
        message: rawError.message,
      });
    }

    return Object.freeze({
      type: API_ERROR_TYPES.UNKNOWN,
      statusCode: 0,
      message: DEFAULT_ERROR_MESSAGES.UNKNOWN,
    });
  }

  private static categorizeStatus(status: number): ApiErrorType {
    if (status === 400 || status === 422) return API_ERROR_TYPES.VALIDATION;
    if (status === 401) return API_ERROR_TYPES.UNAUTHORIZED;
    if (status === 403) return API_ERROR_TYPES.FORBIDDEN;
    if (status === 404) return API_ERROR_TYPES.NOT_FOUND;
    if (status >= 500) return API_ERROR_TYPES.SERVER;
    return API_ERROR_TYPES.UNKNOWN;
  }
}
