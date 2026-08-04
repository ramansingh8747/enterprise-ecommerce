import { HTTP_HEADERS, MEDIA_TYPES } from './http.constants';
import { envConfig } from '@/config/env.config';

/**
 * Enterprise Request Header Configuration (Module 6 - Step 6.2).
 *
 * Populates standard request headers for RTK Query fetchBaseQuery instances.
 */
export function prepareRequestHeaders(headers: Headers): Headers {
  if (!headers.has(HTTP_HEADERS.CONTENT_TYPE)) {
    headers.set(HTTP_HEADERS.CONTENT_TYPE, MEDIA_TYPES.JSON);
  }

  if (!headers.has(HTTP_HEADERS.ACCEPT)) {
    headers.set(HTTP_HEADERS.ACCEPT, MEDIA_TYPES.JSON);
  }

  if (!headers.has(HTTP_HEADERS.X_API_VERSION)) {
    headers.set(HTTP_HEADERS.X_API_VERSION, envConfig.apiVersion);
  }

  return headers;
}
