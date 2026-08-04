import type { ApiTagType } from './api.types';

/**
 * Enterprise API Helper Utilities (Module 6 - Step 6.1).
 *
 * Helper functions for constructing RTK Query cache invalidation tags.
 */

export interface ITagDescription<T extends ApiTagType> {
  readonly type: T;
  readonly id?: string | number;
}

/**
 * Builds a typed cache tag description object for RTK Query invalidation.
 */
export function buildApiTag<T extends ApiTagType>(type: T, id?: string | number): ITagDescription<T> {
  return id !== undefined ? { type, id } : { type };
}
