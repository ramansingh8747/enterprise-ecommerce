import { RateLimitScope, RateLimitStatus, RateLimitStrategy } from '../enums/rate-limit.enums';

/**
 * Enterprise Rate Limit Module Types (Module 28.1).
 *
 * Domain types for keys, filters, metrics, query criteria, and contexts.
 */

/** Formatted storage key string for rate limit tracking. */
export type RateLimitKey = string;

/** Filtering criteria for querying rate limit records and metrics. */
export interface RateLimitFilters {
  scope?: RateLimitScope;
  status?: RateLimitStatus;
  strategy?: RateLimitStrategy;
  identifier?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

/** Operational metrics metrics container. */
export interface RateLimitMetrics {
  totalEvaluations: number;
  allowedCount: number;
  limitedCount: number;
  blockedCount: number;
  whitelistedCount: number;
  averageResponseTimeMs: number;
}

/** Summary overview data structure. */
export interface RateLimitSummary {
  activeKeys: number;
  blockedClientsCount: number;
  whitelistedClientsCount: number;
  metrics: RateLimitMetrics;
}

/** Request execution context payload for rate limiting decisions. */
export interface RateLimitContext {
  ip?: string;
  userId?: string;
  apiKey?: string;
  route?: string;
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  timestamp?: number;
}

/** Standard pagination options for rate limit record queries. */
export interface RateLimitPagination {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/** Search options for rate limit administration. */
export interface RateLimitSearchOptions {
  query?: string;
  scope?: RateLimitScope;
  status?: RateLimitStatus;
}
