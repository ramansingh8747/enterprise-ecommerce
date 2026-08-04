import type { IApiErrorDetail } from '@/shared/interfaces/api.interface';

/**
 * Enterprise API Error Type Definitions (Module 6 - Step 6.4).
 *
 * Categorized error types and normalized error contract.
 */

export type ApiErrorType =
  | 'validation'
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'server'
  | 'unknown';

export interface INormalizedApiError {
  readonly type: ApiErrorType;
  readonly statusCode: number;
  readonly message: string;
  readonly details?: readonly IApiErrorDetail[];
  readonly timestamp?: string;
}
