import { CacheNamespace } from '../enums/cache.enums';

/**
 * Cache Invalidate Request DTO (Module 26.5).
 *
 * Payload shape for invalidating targeted keys, namespaces, or entity rules.
 */
export interface CacheInvalidateDto {
  /** Array of specific keys to invalidate. */
  keys?: string[];

  /** Array of namespaces to invalidate. */
  namespaces?: Array<CacheNamespace | string>;

  /** Glob/regex matching pattern strings (logical preparation). */
  patterns?: string[];

  /** Domain entity type (e.g. 'PRODUCT', 'ORDER'). */
  entity?: string;

  /** Optional specific domain entity ID. */
  entityId?: string;
}
