import type { FieldValues, UseFormSetError, Path } from 'react-hook-form';
import { ZodError } from 'zod';
import { isApiError, formatErrorMessage, extractValidationErrors } from '../../helpers/error.helper';

/**
 * Enterprise useFormErrors Hook (Module 9 - Step 9.16).
 *
 * Provides reusable helpers to extract and normalize validation errors from
 * React Hook Form, Zod schemas, and backend API responses into standard { field: message } structures.
 */
export function useFormErrors() {
  /**
   * Normalizes React Hook Form field errors into a flat dictionary of { fieldPath: errorMessage }.
   */
  const normalizeRHFErrors = (errors: Record<string, unknown>): Record<string, string> => {
    const result: Record<string, string> = {};

    const recurse = (obj: unknown, path = '') => {
      if (!obj || typeof obj !== 'object') return;

      const record = obj as Record<string, unknown>;
      if ('message' in record && typeof record.message === 'string') {
        result[path] = record.message;
        return;
      }

      for (const key in record) {
        if (Object.prototype.hasOwnProperty.call(record, key)) {
          const currentPath = path ? `${path}.${key}` : key;
          recurse(record[key], currentPath);
        }
      }
    };

    recurse(errors);
    return result;
  };

  /**
   * Normalizes ZodErrors into a flat dictionary of { fieldPath: errorMessage }.
   */
  const normalizeZodErrors = (error: ZodError): Record<string, string> => {
    const result: Record<string, string> = {};
    error.errors.forEach((err) => {
      const fieldPath = err.path.join('.');
      result[fieldPath] = err.message;
    });
    return result;
  };

  /**
   * Normalizes API validation errors from backend responses into a flat dictionary.
   */
  const normalizeApiErrors = (
    error: unknown
  ): { message: string; fieldErrors: Record<string, string> } => {
    // 1. Structured API Error (conforming to IApiError)
    if (isApiError(error)) {
      const fieldErrors = extractValidationErrors(error.errors);
      return {
        message: error.message || 'Validation failed.',
        fieldErrors,
      };
    }

    // 2. RTK Query / Axios Response wrapper check
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      const payload = errorObj.data || errorObj.payload;
      if (isApiError(payload)) {
        return {
          message: payload.message || 'Validation failed.',
          fieldErrors: extractValidationErrors(payload.errors),
        };
      }
    }

    return {
      message: formatErrorMessage(error),
      fieldErrors: {},
    };
  };

  /**
   * Safe getter to extract field error messages dynamically using field dot-notation paths.
   */
  const getFieldError = (errors: Record<string, unknown>, fieldName: string): string | undefined => {
    const parts = fieldName.split('.');
    let current: unknown = errors;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    if (current && typeof current === 'object' && 'message' in (current as Record<string, unknown>)) {
      const msg = (current as Record<string, unknown>).message;
      if (typeof msg === 'string') {
        return msg;
      }
    }

    return undefined;
  };

  /**
   * Populates React Hook Form fields with API server validation errors.
   */
  const setFormApiErrors = <TFieldValues extends FieldValues>(
    setError: UseFormSetError<TFieldValues>,
    error: unknown
  ) => {
    const { fieldErrors } = normalizeApiErrors(error);
    Object.entries(fieldErrors).forEach(([field, msg]) => {
      setError(field as Path<TFieldValues>, { type: 'server', message: msg });
    });
  };

  return {
    normalizeRHFErrors,
    normalizeZodErrors,
    normalizeApiErrors,
    getFieldError,
    setFormApiErrors,
    getErrorMessage: formatErrorMessage,
  };
}
