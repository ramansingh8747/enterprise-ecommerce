import { CacheNamespace } from '../enums/cache.enums';
import { CacheKey, CacheValue } from '../types/cache.types';

/**
 * Enterprise Cache Entry Storage Model (Module 26.2).
 *
 * Represents an individual in-memory cached record containing payload,
 * expiration bounds, access statistics, and byte size metadata.
 */
export class CacheEntryRecord<T = unknown> {
  public readonly key: CacheKey;
  public readonly namespace: CacheNamespace | string;
  public readonly value: CacheValue<T>;
  public readonly ttl: number;
  public readonly createdAt: Date;
  public readonly expiresAt: Date;
  public readonly sizeBytes: number;

  public lastAccessedAt: Date;
  public accessCount: number;
  public readonly metadata: Record<string, unknown>;

  constructor(
    key: CacheKey,
    value: CacheValue<T>,
    ttl: number,
    namespace: CacheNamespace | string = CacheNamespace.SETTINGS,
    tags?: string[],
    metadata?: Record<string, unknown>
  ) {
    this.key = key;
    this.value = value;
    this.ttl = ttl;
    this.namespace = namespace;
    this.createdAt = new Date();
    this.expiresAt = new Date(this.createdAt.getTime() + ttl * 1000);
    this.lastAccessedAt = new Date();
    this.accessCount = 0;
    this.sizeBytes = CacheEntryRecord.estimateSizeBytes(value);
    this.metadata = {
      ...(metadata || {}),
      tags: tags || [],
    };
  }

  /**
   * Checks whether the current entry has exceeded its expiration timestamp.
   *
   * @returns True if expired.
   */
  isExpired(): boolean {
    return Date.now() >= this.expiresAt.getTime();
  }

  /**
   * Updates entry access metrics on cache hit.
   */
  touch(): void {
    this.lastAccessedAt = new Date();
    this.accessCount += 1;
  }

  /**
   * Estimates byte size of arbitrary serializable cache values.
   *
   * @param val Value payload.
   * @returns Estimated byte count.
   */
  static estimateSizeBytes(val: unknown): number {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'boolean') return 4;
    if (typeof val === 'number') return 8;
    if (typeof val === 'string') return val.length * 2;
    if (val instanceof Date) return 24;

    try {
      const json = JSON.stringify(val);
      return json ? json.length * 2 : 128;
    } catch {
      return 128;
    }
  }
}
