import { RateLimitStrategy, ThrottleAction } from '../enums/rate-limit.enums';
import {
  DEFAULT_BLOCK_DURATION_MS,
  DEFAULT_MAX_REQUESTS,
  DEFAULT_RATE_LIMIT_STRATEGY,
  DEFAULT_THROTTLE_ACTION,
  DEFAULT_WINDOW_MS,
} from '../constants/rate-limit.constants';

/**
 * Enterprise Rate Limit Module Configuration Interface (Module 28.1 / 28.6).
 *
 * Strongly-typed options governing rate limiting algorithms, default quotas,
 * block penalties, throttling actions, whitelist support, trust proxy flags, and analytics tracking.
 */
export interface IRateLimitConfig {
  /** Master switch enabling or disabling API rate limiting system-wide. */
  enabled: boolean;

  /** Active rate limit strategy algorithm (FIXED_WINDOW, SLIDING_WINDOW, etc.). */
  strategy: RateLimitStrategy;

  /** Default time window duration in milliseconds. */
  windowMs: number;

  /** Default maximum allowed requests per time window. */
  maxRequests: number;

  /** Penalty block duration in milliseconds for blocked clients. */
  blockDurationMs: number;

  /** Default action taken when request quota is exceeded. */
  throttleAction: ThrottleAction;

  /** Whitelist of IP addresses or client IDs exempted from rate limits. */
  whitelist: string[];

  /** Blacklist of IP addresses or client IDs permanently blocked. */
  blacklist: string[];

  /** Master switch enabling or disabling whitelist processing. */
  whitelistEnabled: boolean;

  /** Whether reverse proxy X-Forwarded-For headers should be trusted. */
  trustProxy: boolean;

  /** Whether execution statistics tracking is enabled. */
  statisticsEnabled: boolean;
}

/**
 * Default production-ready rate limiting configuration with environment fallbacks.
 */
export const DEFAULT_RATE_LIMIT_CONFIG: IRateLimitConfig = {
  enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
  strategy: (process.env.RATE_LIMIT_STRATEGY as RateLimitStrategy) || DEFAULT_RATE_LIMIT_STRATEGY,
  windowMs: process.env.RATE_LIMIT_DEFAULT_WINDOW
    ? parseInt(process.env.RATE_LIMIT_DEFAULT_WINDOW, 10)
    : process.env.RATE_LIMIT_WINDOW_MS
    ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10)
    : DEFAULT_WINDOW_MS,
  maxRequests: process.env.RATE_LIMIT_DEFAULT_MAX_REQUESTS
    ? parseInt(process.env.RATE_LIMIT_DEFAULT_MAX_REQUESTS, 10)
    : process.env.RATE_LIMIT_MAX_REQUESTS
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10)
    : DEFAULT_MAX_REQUESTS,
  blockDurationMs: process.env.RATE_LIMIT_BLOCK_DURATION
    ? parseInt(process.env.RATE_LIMIT_BLOCK_DURATION, 10)
    : process.env.RATE_LIMIT_BLOCK_DURATION_MS
    ? parseInt(process.env.RATE_LIMIT_BLOCK_DURATION_MS, 10)
    : DEFAULT_BLOCK_DURATION_MS,
  throttleAction: (process.env.RATE_LIMIT_THROTTLE_ACTION as ThrottleAction) || DEFAULT_THROTTLE_ACTION,
  whitelist: process.env.RATE_LIMIT_WHITELIST
    ? process.env.RATE_LIMIT_WHITELIST.split(',').map((s) => s.trim())
    : ['127.0.0.1', '::1', 'localhost'],
  blacklist: process.env.RATE_LIMIT_BLACKLIST
    ? process.env.RATE_LIMIT_BLACKLIST.split(',').map((s) => s.trim())
    : [],
  whitelistEnabled: process.env.RATE_LIMIT_WHITELIST_ENABLED !== 'false',
  trustProxy: process.env.RATE_LIMIT_TRUST_PROXY === 'true',
  statisticsEnabled:
    process.env.RATE_LIMIT_ENABLE_STATISTICS !== 'false' &&
    process.env.RATE_LIMIT_STATISTICS_ENABLED !== 'false',
};
