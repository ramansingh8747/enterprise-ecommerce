import type { ApiTagCategory, ITagDescriptor } from './tag.types';

/**
 * Enterprise Cache Tag Helper Utilities (Module 6 - Step 6.3).
 *
 * Provides tag array generation for RTK Query endpoints.
 */

/**
 * Generates cache tag descriptors for list endpoints (including individual items and 'LIST' ID).
 */
export function providesListTags<T extends { id: string | number }, K extends ApiTagCategory>(
  results: readonly T[] | undefined,
  type: K
): readonly ITagDescriptor<K>[] {
  if (results && Array.isArray(results)) {
    return [
      { type, id: 'LIST' },
      ...results.map((item) => ({ type, id: item.id })),
    ];
  }
  return [{ type, id: 'LIST' }];
}

/**
 * Generates cache tag invalidation array for mutating list endpoints.
 */
export function invalidatesListTags<K extends ApiTagCategory>(type: K): readonly ITagDescriptor<K>[] {
  return [{ type, id: 'LIST' }];
}

/**
 * Generates cache tag descriptor for single item endpoint.
 */
export function providesItemTag<K extends ApiTagCategory>(
  type: K,
  id?: string | number
): readonly ITagDescriptor<K>[] {
  return id !== undefined ? [{ type, id }] : [{ type }];
}
