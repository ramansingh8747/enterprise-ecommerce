import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from './api.config';
import { prepareRequestHeaders } from './request.config';

/**
 * Enterprise RTK Query Base Query Instance (Module 6 - Step 6.2).
 *
 * Configures fetchBaseQuery with centralized baseUrl, timeout, and header preparation.
 */
export const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeoutMs,
  prepareHeaders: (headers) => prepareRequestHeaders(headers),
});

export default baseQuery;
