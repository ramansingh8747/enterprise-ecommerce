import { CacheNamespace } from '../enums/cache.enums';

/**
 * Cache Query Request DTO (Module 26.5).
 *
 * Query parameters received for retrieving cached entries.
 */
export interface CacheQueryDto {
  /** Target cache key string. */
  key: string;

  /** Optional target domain namespace filter. */
  namespace?: CacheNamespace | string;

  /** Optional flag whether to include entry metadata. */
  includeMetadata?: boolean;
}
