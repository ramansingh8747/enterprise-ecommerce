/**
 * API Response Interfaces (Module 2 - Step 2.2).
 */

/** Validation error field item interface. */
export interface IApiErrorDetail {
  readonly field: string;
  readonly message: string;
  readonly value?: unknown;
}

/** Normalized API Error Payload interface. */
export interface IApiError {
  readonly statusCode: number;
  readonly message: string;
  readonly errors?: readonly IApiErrorDetail[];
  readonly timestamp?: string;
  readonly path?: string;
}

/** Standard backend API response envelope matching backend contract. */
export interface IApiResponse<T = unknown> {
  readonly success: boolean;
  readonly message: string;
  readonly data?: T;
  readonly error?: IApiError;
}
