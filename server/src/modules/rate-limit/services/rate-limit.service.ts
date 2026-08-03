import {
  IRateLimitEntry,
  IRateLimitOptions,
  IRateLimitProvider,
  IRateLimitResult,
  IRateLimitService,
  IRateLimitStatistics,
} from '../interfaces/rate-limit.interfaces';
import { RateLimitContext, RateLimitFilters } from '../types/rate-limit.types';
import { RateLimitScope, RateLimitStatus, RateLimitStrategy } from '../enums/rate-limit.enums';
import { DEFAULT_RATE_LIMIT_CONFIG, IRateLimitConfig } from '../config/rate-limit.config';
import { RateLimitUtil } from '../utils/rate-limit.util';

/**
 * Enterprise Rate Limit Application Service Implementation (Module 28.3).
 *
 * Core business logic layer for API rate limiting and throttling.
 * Communicates strictly through the IRateLimitProvider abstraction (DIP).
 * Handles client identifier resolution, whitelist/blacklist checks, storage provider consumption,
 * response header formatting, and aggregate operational analytics.
 */
export class RateLimitService implements IRateLimitService {
  private readonly whitelistSet: Set<string>;
  private readonly blacklistSet: Set<string>;

  constructor(
    private readonly provider: IRateLimitProvider,
    private readonly config: IRateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG
  ) {
    this.whitelistSet = new Set<string>(
      (config.whitelist || []).map((id) => RateLimitUtil.normalizeIdentifier(id))
    );
    this.blacklistSet = new Set<string>(
      (config.blacklist || []).map((id) => RateLimitUtil.normalizeIdentifier(id))
    );
  }

  /* ========================================================================
     PRIVATE HELPER METHODS
     ====================================================================== */

  /**
   * Resolves raw client identifier string based on requested scope.
   */
  private resolveIdentifier(context: RateLimitContext, scope: RateLimitScope): string {
    switch (scope) {
      case RateLimitScope.USER:
        return context.userId || context.ip || 'anonymous_user';
      case RateLimitScope.API_KEY:
        return context.apiKey || context.ip || 'anonymous_key';
      case RateLimitScope.ROUTE:
        return `${context.route || 'route'}:${context.ip || '127.0.0.1'}`;
      case RateLimitScope.GLOBAL:
        return 'global_scope';
      case RateLimitScope.IP:
      default:
        return context.ip || '127.0.0.1';
    }
  }

  /**
   * Validates client identifier string.
   */
  private validateIdentifier(identifier?: string): void {
    if (!RateLimitUtil.validateIdentifier(identifier)) {
      throw new Error(`Invalid rate limit identifier: '${identifier}'. Must be non-empty string <= 256 chars.`);
    }
  }

  /* ========================================================================
     PUBLIC SERVICE METHODS
     ====================================================================== */

  /**
   * Evaluates rate limit status for incoming request context.
   *
   * @param context Request context payload (IP, userId, route, etc.).
   * @param options Route or scope level rate limit options.
   */
  async check(context: RateLimitContext, options?: IRateLimitOptions): Promise<IRateLimitResult> {
    if (!this.config.enabled) {
      const limit = options?.maxRequests || this.config.maxRequests;
      return {
        status: RateLimitStatus.ALLOWED,
        allowed: true,
        limit,
        remaining: limit,
        resetTimeMs: Date.now() + (options?.windowMs || this.config.windowMs),
        headers: RateLimitUtil.buildHeaders(limit, limit, Date.now() + (options?.windowMs || this.config.windowMs)),
      };
    }

    const scope = options?.scope || RateLimitScope.IP;
    const rawId = this.resolveIdentifier(context, scope);
    const identifier = RateLimitUtil.normalizeIdentifier(rawId);
    const maxRequests = options?.maxRequests || this.config.maxRequests;
    const windowMs = options?.windowMs || this.config.windowMs;
    const strategy = options?.strategy || this.config.strategy || RateLimitStrategy.FIXED_WINDOW;

    // 1. Check active Whitelist
    if (this.whitelistSet.has(identifier)) {
      const resetTimeMs = RateLimitUtil.calculateResetTime(windowMs);
      return {
        status: RateLimitStatus.WHITELISTED,
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests,
        resetTimeMs,
        headers: RateLimitUtil.buildHeaders(maxRequests, maxRequests, resetTimeMs),
      };
    }

    // 2. Check active Blacklist
    if (this.blacklistSet.has(identifier)) {
      const resetTimeMs = Date.now() + this.config.blockDurationMs;
      const retryAfterSeconds = Math.ceil(this.config.blockDurationMs / 1000);
      return {
        status: RateLimitStatus.BLOCKED,
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        resetTimeMs,
        retryAfterSeconds,
        headers: RateLimitUtil.buildHeaders(maxRequests, 0, resetTimeMs, retryAfterSeconds),
      };
    }

    // 3. Construct storage key & consume hit from provider
    const key = options?.keyGenerator
      ? options.keyGenerator(context)
      : RateLimitUtil.buildRateLimitKey(scope, identifier);

    const entry: IRateLimitEntry = await this.provider.consume(key, {
      scope,
      maxRequests,
      windowMs,
      strategy,
      throttleAction: options?.throttleAction || this.config.throttleAction,
    });

    const isAllowed = entry.status === RateLimitStatus.ALLOWED;
    const retryAfterSeconds = !isAllowed
      ? Math.max(1, Math.ceil((entry.resetTimeMs - Date.now()) / 1000))
      : undefined;

    return {
      status: entry.status,
      allowed: isAllowed,
      limit: maxRequests,
      remaining: entry.remaining,
      resetTimeMs: entry.resetTimeMs,
      retryAfterSeconds,
      headers: RateLimitUtil.buildHeaders(maxRequests, entry.remaining, entry.resetTimeMs, retryAfterSeconds),
    };
  }

  /**
   * Resets rate limit quota for a specified identifier.
   *
   * @param identifier Client IP, userId, or raw key string.
   * @param scope Optional scope identifier. Defaults to IP.
   */
  async reset(identifier: string, scope: RateLimitScope = RateLimitScope.IP): Promise<boolean> {
    this.validateIdentifier(identifier);
    const normalized = RateLimitUtil.normalizeIdentifier(identifier);
    const key = identifier.includes(':')
      ? identifier
      : RateLimitUtil.buildRateLimitKey(scope, normalized);

    return this.provider.reset(key);
  }

  /**
   * Resets rate limit quotas for multiple identifiers in batch.
   *
   * @param identifiers Array of client identifiers or keys.
   * @param scope Optional scope classification.
   */
  async resetMany(
    identifiers: string[],
    scope: RateLimitScope = RateLimitScope.IP
  ): Promise<{ resetCount: number; failedCount: number }> {
    if (!identifiers || identifiers.length === 0) {
      return { resetCount: 0, failedCount: 0 };
    }

    const keys = identifiers.map((id) =>
      id.includes(':') ? id : RateLimitUtil.buildRateLimitKey(scope, RateLimitUtil.normalizeIdentifier(id))
    );

    const resetCount = await this.provider.resetMany(keys);
    return {
      resetCount,
      failedCount: keys.length - resetCount,
    };
  }

  /**
   * Adds an identifier to the active whitelist.
   */
  async whitelist(identifier: string): Promise<boolean> {
    this.validateIdentifier(identifier);
    const normalized = RateLimitUtil.normalizeIdentifier(identifier);
    this.whitelistSet.add(normalized);
    this.blacklistSet.delete(normalized);
    return true;
  }

  /**
   * Removes an identifier from the active whitelist.
   */
  async removeWhitelist(identifier: string): Promise<boolean> {
    this.validateIdentifier(identifier);
    const normalized = RateLimitUtil.normalizeIdentifier(identifier);
    return this.whitelistSet.delete(normalized);
  }

  /**
   * Adds an identifier to the penalty blacklist.
   */
  async blacklist(identifier: string, _durationMs?: number): Promise<boolean> {
    this.validateIdentifier(identifier);
    const normalized = RateLimitUtil.normalizeIdentifier(identifier);
    this.blacklistSet.add(normalized);
    this.whitelistSet.delete(normalized);
    return true;
  }

  /**
   * Removes an identifier from the penalty blacklist.
   */
  async removeBlacklist(identifier: string): Promise<boolean> {
    this.validateIdentifier(identifier);
    const normalized = RateLimitUtil.normalizeIdentifier(identifier);
    return this.blacklistSet.delete(normalized);
  }

  /**
   * Computes aggregate rate limit system statistics metrics.
   *
   * @param _filters Optional criteria filters.
   */
  async statistics(_filters?: RateLimitFilters): Promise<IRateLimitStatistics> {
    const providerStats = await this.provider.statistics();
    return {
      activeKeysCount: providerStats.activeKeysCount,
      blockedClientsCount: this.blacklistSet.size,
      whitelistedClientsCount: this.whitelistSet.size,
      metrics: {
        ...providerStats.metrics,
        blockedCount: providerStats.metrics.blockedCount + this.blacklistSet.size,
        whitelistedCount: providerStats.metrics.whitelistedCount + this.whitelistSet.size,
      },
    };
  }
}
