import { RateLimitScope, RateLimitStrategy, ThrottleAction } from '../enums/rate-limit.enums';

/**
 * Enterprise Rate Limit Policy Definition (Module 28.4).
 *
 * Defines quota rules, time window durations, algorithms, scopes,
 * and enforcement actions for different endpoint categories across the application.
 */
export interface IRateLimitPolicy {
  /** Unique name identifier for the policy (e.g. 'STRICT_AUTH', 'PUBLIC_API'). */
  name: string;

  /** Maximum allowed request quota per window. */
  maxRequests: number;

  /** Window duration in milliseconds. */
  windowMs: number;

  /** Rate limit evaluation scope (IP, USER, API_KEY, ROUTE, GLOBAL). */
  scope: RateLimitScope;

  /** Strategy algorithm (FIXED_WINDOW, SLIDING_WINDOW, TOKEN_BUCKET). */
  strategy: RateLimitStrategy;

  /** Enforcement action when quota is exceeded (REJECT, DELAY, LOG_ONLY). */
  throttleAction: ThrottleAction;

  /** Human-readable description of policy intent. */
  description?: string;
}

/**
 * Predefined Production Policy Matrices.
 */

/** Strict limits for authentication & sensitive endpoints (login, register, reset-password). */
export const STRICT_AUTH_POLICY: IRateLimitPolicy = {
  name: 'STRICT_AUTH',
  maxRequests: 10,
  windowMs: 900000, // 15 minutes
  scope: RateLimitScope.IP,
  strategy: RateLimitStrategy.FIXED_WINDOW,
  throttleAction: ThrottleAction.REJECT,
  description: 'Strict rate limits for authentication endpoints to prevent brute-force attacks.',
};

/** Moderate limits for public browsing & catalog read APIs. */
export const PUBLIC_API_POLICY: IRateLimitPolicy = {
  name: 'PUBLIC_API',
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  scope: RateLimitScope.IP,
  strategy: RateLimitStrategy.FIXED_WINDOW,
  throttleAction: ThrottleAction.REJECT,
  description: 'Moderate rate limits for general public REST API endpoints.',
};

/** Higher limits for authenticated administration & management APIs. */
export const ADMIN_API_POLICY: IRateLimitPolicy = {
  name: 'ADMIN_API',
  maxRequests: 1000,
  windowMs: 60000, // 1 minute
  scope: RateLimitScope.USER,
  strategy: RateLimitStrategy.SLIDING_WINDOW,
  throttleAction: ThrottleAction.REJECT,
  description: 'High quota limits for authenticated administrative management routes.',
};

/** High throughput limits for incoming payment/provider webhooks. */
export const WEBHOOK_POLICY: IRateLimitPolicy = {
  name: 'WEBHOOK',
  maxRequests: 300,
  windowMs: 60000, // 1 minute
  scope: RateLimitScope.IP,
  strategy: RateLimitStrategy.FIXED_WINDOW,
  throttleAction: ThrottleAction.REJECT,
  description: 'High burst throughput policy for payment and provider webhook callbacks.',
};

/** Restrictive limits for document & file upload endpoints. */
export const FILE_UPLOAD_POLICY: IRateLimitPolicy = {
  name: 'FILE_UPLOAD',
  maxRequests: 20,
  windowMs: 60000, // 1 minute
  scope: RateLimitScope.USER,
  strategy: RateLimitStrategy.FIXED_WINDOW,
  throttleAction: ThrottleAction.REJECT,
  description: 'Upload quota policy restricting file attachment volume.',
};
