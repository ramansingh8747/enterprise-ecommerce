/**
 * Global API Types (Module 2 - Step 2.2).
 *
 * Request methods, sorting, and API query parameters.
 */

/** HTTP Request Methods. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Sorting Direction Order. */
export type SortOrder = 'asc' | 'desc' | 'ASC' | 'DESC';

/** Request query parameters dictionary. */
export type QueryParams = Record<string, string | number | boolean | readonly string[] | undefined>;
