import {
  RateLimitScope,
  RateLimitStatus,
  RateLimitStrategy,
  ThrottleAction,
} from '../enums/rate-limit.enums';
import {
  RateLimitContext,
  RateLimitFilters,
  RateLimitMetrics,
  RateLimitPagination,
} from '../types/rate-limit.types';

/**
 * Enterprise Rate Limit Domain Interfaces (Module 28.1).
 *
 * Core abstractions defining entries, options, evaluation results, statistics,
 * policies, provider contracts, and service contracts across the platform.
 */

/**
 * In-memory or persistent storage record for a rate-limited key.
 */
export interface IRateLimitEntry {
  /** Unique composite key string (e.g. 'ratelimit:ip:127.0.0.1'). */
  key: string;

  /** Scope classification (IP, USER, API_KEY, ROUTE, GLOBAL). */
  scope: RateLimitScope;

  /** Identifier value associated with scope (e.g. IP address or userId). */
  identifier: string;

  /** Total number of requests registered in current window. */
  hits: number;

  /** Remaining quota capacity before rate limiting occurs. */
  remaining: number;

  /** Unix epoch timestamp in milliseconds when the window resets. */
  resetTimeMs: number;

  /** Current evaluation status (ALLOWED, LIMITED, BLOCKED, WHITELISTED). */
  status: RateLimitStatus;

  /** Expiration timestamp for penalty blocks if blocked. */
  blockedUntilMs?: number;

  /** Creation timestamp of the rate limit entry. */
  createdAt: Date;

  /** Last update timestamp of the rate limit entry. */
  updatedAt: Date;
}

/**
 * Per-route or per-scope rate limiting evaluation options.
 */
export interface IRateLimitOptions {
  /** Target scope level. Defaults to IP. */
  scope?: RateLimitScope;

  /** Maximum allowed request quota. Defaults to system config. */
  maxRequests?: number;

  /** Time window duration in milliseconds. Defaults to system config. */
  windowMs?: number;

  /** Strategy algorithm override (FIXED_WINDOW, SLIDING_WINDOW, TOKEN_BUCKET). */
  strategy?: RateLimitStrategy;

  /** Action taken when quota is exceeded (REJECT, DELAY, LOG_ONLY). */
  throttleAction?: ThrottleAction;

  /** Custom key generator function. */
  keyGenerator?: (context: RateLimitContext) => string;

  /** Skip evaluation predicate function. */
  skip?: (context: RateLimitContext) => boolean;
}

/**
 * Result structure returned after evaluating a rate limit request.
 */
export interface IRateLimitResult {
  /** Evaluation status (ALLOWED, LIMITED, BLOCKED, WHITELISTED). */
  status: RateLimitStatus;

  /** Whether the request is allowed to proceed. */
  allowed: boolean;

  /** Total quota limit configured for the window. */
  limit: number;

  /** Remaining requests available in current window. */
  remaining: number;

  /** Unix timestamp in milliseconds when current window resets. */
  resetTimeMs: number;

  /** Retry-After duration in seconds (present if limited or blocked). */
  retryAfterSeconds?: number;

  /** Recommended HTTP headers to append to API response. */
  headers: Record<string, string>;
}

/**
 * Aggregate operational statistics interface.
 */
export interface IRateLimitStatistics {
  activeKeysCount: number;
  blockedClientsCount: number;
  whitelistedClientsCount: number;
  metrics: RateLimitMetrics;
}

/**
 * Dynamic Throttling Policy contract.
 */
export interface IThrottlePolicy {
  name: string;
  scope: RateLimitScope;
  maxRequests: number;
  windowMs: number;
  action: ThrottleAction;
}

/**
 * Rate Limit Storage Provider Abstraction Interface (DIP).
 */
export interface IRateLimitProvider {
  /**
   * Consumes 1 hit against specified key and returns updated entry.
   *
   * @param key Storage key string.
   * @param options Rate limit options (window, quota, strategy).
   */
  consume(key: string, options: IRateLimitOptions): Promise<IRateLimitEntry>;

  /**
   * Resets rate limit quota for a specified key.
   *
   * @param key Storage key string.
   */
  reset(key: string): Promise<boolean>;

  /**
   * Resets rate limit quotas for multiple keys matching pattern or array.
   *
   * @param keys Array of key strings.
   */
  resetMany(keys: string[]): Promise<number>;

  /**
   * Retrieves current rate limit entry for a key without consuming hits.
   *
   * @param key Storage key string.
   */
  get(key: string): Promise<IRateLimitEntry | null>;

  /**
   * Checks whether a active entry exists for a key.
   *
   * @param key Storage key string.
   */
  exists(key: string): Promise<boolean>;

  /**
   * Returns aggregate storage provider statistics.
   */
  statistics(): Promise<IRateLimitStatistics>;
}

/**
 * Rate Limit Application Service Interface.
 */
export interface IRateLimitService {
  /**
   * Evaluates rate limit status for incoming request context.
   *
   * @param context Execution context (IP, userId, route, etc.).
   * @param options Optional route/scope override options.
   */
  check(context: RateLimitContext, options?: IRateLimitOptions): Promise<IRateLimitResult>;

  /**
   * Resets rate limit for a specific identifier or key.
   *
   * @param identifier Client IP, userId, or raw key.
   * @param scope Optional scope classification.
   */
  reset(identifier: string, scope?: RateLimitScope): Promise<boolean>;

  /**
   * Resets rate limit quotas for multiple identifiers in batch.
   *
   * @param identifiers Array of client identifiers or keys.
   * @param scope Optional scope classification.
   */
  resetMany(
    identifiers: string[],
    scope?: RateLimitScope
  ): Promise<{ resetCount: number; failedCount: number }>;

  /**
   * Adds an identifier to the active whitelist.
   *
   * @param identifier Client IP or ID.
   */
  whitelist(identifier: string): Promise<boolean>;

  /**
   * Removes an identifier from the active whitelist.
   *
   * @param identifier Client IP or ID.
   */
  removeWhitelist(identifier: string): Promise<boolean>;

  /**
   * Adds an identifier to the active penalty blacklist.
   *
   * @param identifier Client IP or ID.
   * @param durationMs Optional block duration in milliseconds.
   */
  blacklist(identifier: string, durationMs?: number): Promise<boolean>;

  /**
   * Removes an identifier from the active penalty blacklist.
   *
   * @param identifier Client IP or ID.
   */
  removeBlacklist(identifier: string): Promise<boolean>;

  /**
   * Computes aggregate rate limit system statistics metrics.
   *
   * @param filters Optional criteria filters.
   */
  statistics(filters?: RateLimitFilters): Promise<IRateLimitStatistics>;
}
