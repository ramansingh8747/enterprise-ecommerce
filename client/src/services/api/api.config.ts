import { envConfig } from '@/config/env.config';
import type { IBaseQueryOptions } from './api.types';

/**
 * Enterprise API Configuration Options (Module 6 - Step 6.1).
 *
 * Centralized settings for RTK Query fetchBaseQuery instance.
 */
export const API_CONFIG: IBaseQueryOptions = Object.freeze({
  baseUrl: envConfig.apiBaseUrl,
  timeoutMs: envConfig.apiTimeoutMs,
});
