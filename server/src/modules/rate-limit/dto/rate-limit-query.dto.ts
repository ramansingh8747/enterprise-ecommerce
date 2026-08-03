import { RateLimitScope } from '../enums/rate-limit.enums';

/**
 * Rate Limit Query Request DTO (Module 28.5).
 *
 * Query parameters for checking client rate limit status and metrics.
 */
export interface RateLimitQueryDto {
  /** Target client identifier (IP address, userId, or key). */
  identifier?: string;

  /** Scope classification (IP, USER, API_KEY, ROUTE, GLOBAL). */
  scope?: RateLimitScope;

  /** Whether to include system operational statistics in response. */
  includeStatistics?: boolean;
}
