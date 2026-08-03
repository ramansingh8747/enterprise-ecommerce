import { RateLimitScope, RateLimitStatus, RateLimitStrategy } from '../enums/rate-limit.enums';
import { IRateLimitEntry } from '../interfaces/rate-limit.interfaces';

/**
 * Production In-Memory Rate Limit Entry Record (Module 28.2).
 *
 * Wraps rate limiting tracking state per client key, providing helper methods
 * for expiration checking, penalty block checks, and memory byte size estimation.
 */
export class RateLimitEntryRecord implements IRateLimitEntry {
  public key: string;
  public identifier: string;
  public scope: RateLimitScope;
  public strategy: RateLimitStrategy;
  public hits: number;
  public remaining: number;
  public resetTimeMs: number;
  public status: RateLimitStatus;
  public blockedUntilMs?: number;
  public createdAt: Date;
  public updatedAt: Date;
  public metadata?: Record<string, unknown>;

  constructor(params: {
    key: string;
    identifier: string;
    scope: RateLimitScope;
    strategy: RateLimitStrategy;
    hits: number;
    remaining: number;
    resetTimeMs: number;
    status: RateLimitStatus;
    blockedUntilMs?: number;
    createdAt?: Date;
    updatedAt?: Date;
    metadata?: Record<string, unknown>;
  }) {
    this.key = params.key;
    this.identifier = params.identifier;
    this.scope = params.scope;
    this.strategy = params.strategy;
    this.hits = params.hits;
    this.remaining = params.remaining;
    this.resetTimeMs = params.resetTimeMs;
    this.status = params.status;
    this.blockedUntilMs = params.blockedUntilMs;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
    this.metadata = params.metadata;
  }

  /**
   * Checks whether current window has expired.
   *
   * @param now Current Unix epoch timestamp in milliseconds. Defaults to Date.now().
   */
  isExpired(now: number = Date.now()): boolean {
    return now >= this.resetTimeMs;
  }

  /**
   * Checks whether client key is under an active penalty block.
   *
   * @param now Current Unix epoch timestamp in milliseconds. Defaults to Date.now().
   */
  isBlocked(now: number = Date.now()): boolean {
    return this.blockedUntilMs !== undefined && now < this.blockedUntilMs;
  }

  /**
   * Estimates heap memory consumption in bytes for this record.
   */
  estimateByteSize(): number {
    const keyBytes = this.key.length * 2;
    const idBytes = this.identifier.length * 2;
    const metaBytes = this.metadata ? JSON.stringify(this.metadata).length * 2 : 0;
    // Base object overhead (~128 bytes) + primitive fields (~64 bytes)
    return keyBytes + idBytes + metaBytes + 192;
  }
}
