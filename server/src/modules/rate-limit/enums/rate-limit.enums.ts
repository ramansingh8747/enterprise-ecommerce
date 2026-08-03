/**
 * Enterprise API Rate Limiting & Throttling Module — Shared Enumerations (Module 28.1).
 *
 * Centralized domain enums representing rate limiting strategies, scope levels,
 * limit statuses, and throttling enforcement actions.
 */

/**
 * Rate limiting algorithm strategies.
 */
export enum RateLimitStrategy {
  FIXED_WINDOW   = 'FIXED_WINDOW',
  SLIDING_WINDOW = 'SLIDING_WINDOW',
  TOKEN_BUCKET   = 'TOKEN_BUCKET',
  LEAKY_BUCKET   = 'LEAKY_BUCKET',
}

/**
 * Scope boundaries for key identification and quota evaluation.
 */
export enum RateLimitScope {
  GLOBAL  = 'GLOBAL',
  IP      = 'IP',
  USER    = 'USER',
  API_KEY = 'API_KEY',
  ROUTE   = 'ROUTE',
}

/**
 * Evaluation status results for incoming requests.
 */
export enum RateLimitStatus {
  ALLOWED     = 'ALLOWED',
  LIMITED     = 'LIMITED',
  BLOCKED     = 'BLOCKED',
  WHITELISTED = 'WHITELISTED',
}

/**
 * Enforcement action taken when rate limit quotas are exceeded.
 */
export enum ThrottleAction {
  DELAY    = 'DELAY',
  REJECT   = 'REJECT',
  LOG_ONLY = 'LOG_ONLY',
}
