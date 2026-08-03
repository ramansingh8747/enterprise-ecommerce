import { CacheNamespace } from '../enums/cache.enums';

/**
 * Cache Set Request DTO (Module 26.5).
 *
 * Payload shape for storing key-value pairs in the cache store.
 */
export interface CacheSetDto {
  /** Target cache key string. */
  key: string;

  /** Serializable payload value. */
  value: unknown;

  /** Optional time-to-live in seconds. */
  ttl?: number;

  /** Optional target domain namespace. */
  namespace?: CacheNamespace | string;

  /** Optional classification metadata or tags. */
  metadata?: {
    tags?: string[];
    [key: string]: unknown;
  };
}
