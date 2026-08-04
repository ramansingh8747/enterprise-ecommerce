import type { QueryParams } from '@/types/api.types';

/**
 * URL Utility Functions (Module 2 - Step 2.3).
 *
 * Query string serialization and parsing utilities.
 */

/**
 * Serializes a QueryParams dictionary into a URL query string (e.g. "?page=1&limit=10").
 *
 * @param params Query parameters object.
 */
export function buildQueryString(params?: QueryParams): string {
  if (!params || typeof params !== 'object') return '';
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined && item !== null && item !== '') {
            searchParams.append(key, String(item));
          }
        }
      } else {
        searchParams.append(key, String(value));
      }
    }
  }

  const result = searchParams.toString();
  return result ? `?${result}` : '';
}

/**
 * Parses a query string into a key-value dictionary.
 *
 * @param queryString Raw URL query string.
 */
export function parseQueryString(queryString: string): Record<string, string> {
  if (!queryString || typeof queryString !== 'string') return {};
  const clean = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  const searchParams = new URLSearchParams(clean);
  const result: Record<string, string> = {};

  searchParams.forEach((val, key) => {
    result[key] = val;
  });

  return result;
}
