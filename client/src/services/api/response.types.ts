import type { IApiResponse, IApiError } from '@/shared/interfaces/api.interface';

/**
 * Enterprise Response Types for RTK Query (Module 6 - Step 6.2).
 *
 * Generic response payload wrapper contracts.
 */

/** Normalized RTK Query Success Response envelope. */
export type ApiSuccessResponse<T> = IApiResponse<T>;

/** Normalized RTK Query Error Response envelope. */
export type ApiErrorEnvelope = IApiError;
