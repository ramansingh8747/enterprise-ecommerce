import { CacheNamespace } from '../enums/cache.enums';

/**
 * Cache Warmup Request Entry item.
 */
export interface CacheWarmupEntry {
  key: string;
  value: unknown;
  ttl?: number;
}

/**
 * Cache Warmup Request DTO (Module 26.5).
 *
 * Payload shape for pre-loading cache entries in bulk.
 */
export interface CacheWarmupDto {
  /** Target namespace for warmup entries. */
  namespace?: CacheNamespace | string;

  /** Pre-load entry key-value items. */
  entries: CacheWarmupEntry[];

  /** Whether existing keys should be overwritten (default: true). */
  overwriteExisting?: boolean;
}
