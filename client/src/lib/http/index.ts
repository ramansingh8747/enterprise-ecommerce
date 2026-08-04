/**
 * HTTP Client Library Abstraction Placeholder (Module 2 - Step 2.5).
 *
 * This module will expose the enterprise Axios client instance, request/response interceptors,
 * error handling transformers, and authentication token refresh logic in upcoming modules.
 */

export interface IHttpClientOptions {
  readonly baseURL?: string;
  readonly timeout?: number;
  readonly headers?: Record<string, string>;
}

export const HTTP_LIB_MARKER = 'HTTP_LIB_INITIALIZED';
