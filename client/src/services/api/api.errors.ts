import type { INormalizedApiError, ApiErrorType } from './error.types';

/**
 * Enterprise Custom API Exception Class (Module 6 - Step 6.4).
 *
 * Custom Error subclass encapsulating a normalized INormalizedApiError envelope.
 */
export class CustomApiError extends Error {
  public readonly normalizedError: INormalizedApiError;

  constructor(normalizedError: INormalizedApiError) {
    super(normalizedError.message);
    this.name = 'CustomApiError';
    this.normalizedError = normalizedError;
    Object.setPrototypeOf(this, CustomApiError.prototype);
  }

  public get type(): ApiErrorType {
    return this.normalizedError.type;
  }

  public get statusCode(): number {
    return this.normalizedError.statusCode;
  }
}
