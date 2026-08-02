import { SortField, SortDirection } from '../types/search.types';

/**
 * Enterprise Search Engine Default Constants & Boundaries (Module 22.1).
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
export const DEFAULT_SORT: SortField = 'createdAt';
export const DEFAULT_ORDER: SortDirection = 'DESC';
