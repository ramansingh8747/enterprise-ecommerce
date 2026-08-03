import { Request, Response, NextFunction, RequestHandler } from 'express';
import { IRateLimitOptions, IRateLimitService } from '../interfaces/rate-limit.interfaces';
import { rateLimitService as defaultService } from '../../../container';
import { globalRateLimitPolicyRegistry } from '../policies/policy.registry';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { RateLimitContext } from '../types/rate-limit.types';
import { RateLimitScope } from '../enums/rate-limit.enums';

/**
 * Production Rate Limiting Express Middleware Factory (Module 28.4).
 *
 * Intercepts incoming Express HTTP requests, extracts client identity, resolves
 * applicable rate limit policy options, invokes IRateLimitService, sets standard
 * response headers, and returns HTTP 429 Too Many Requests when quota is exceeded.
 *
 * Fails open safely to ensure rate limiting errors never crash request processing.
 *
 * @param policyNameOrOptions Policy string name (e.g. 'STRICT_AUTH') or custom IRateLimitOptions.
 * @param service Optional IRateLimitService override (defaults to container singleton).
 */
export function createRateLimitMiddleware(
  policyNameOrOptions?: string | IRateLimitOptions,
  service: IRateLimitService = defaultService
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Resolve rate limit options from policy registry or options parameter
      let options: IRateLimitOptions | undefined;

      if (typeof policyNameOrOptions === 'string') {
        const policy = globalRateLimitPolicyRegistry.getPolicy(policyNameOrOptions);
        if (policy) {
          options = {
            scope: policy.scope,
            maxRequests: policy.maxRequests,
            windowMs: policy.windowMs,
            strategy: policy.strategy,
            throttleAction: policy.throttleAction,
          };
        }
      } else if (policyNameOrOptions && typeof policyNameOrOptions === 'object') {
        options = policyNameOrOptions;
      }

      // 2. Build execution context
      const user = (req as Request & { user?: { id?: string; _id?: string } }).user;
      const userId = user?.id || user?._id;
      const apiKeyHeader = req.headers['x-api-key'];
      const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;

      const context: RateLimitContext = {
        ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
        userId,
        apiKey,
        route: req.baseUrl + req.path,
        method: req.method,
        headers: req.headers,
        timestamp: Date.now(),
      };

      // 3. Evaluate rate limit status
      const result = await service.check(context, options);

      // 4. Set standard IETF rate limit HTTP headers
      if (result.headers) {
        for (const [headerName, headerValue] of Object.entries(result.headers)) {
          res.setHeader(headerName, headerValue);
        }
      }

      // 5. Handle rate limit exceeded (HTTP 429)
      if (!result.allowed) {
        const response: ApiResponse<null> = {
          success: false,
          message: `Too Many Requests. Rate limit quota of ${result.limit} requests per window exceeded. Please try again after ${result.retryAfterSeconds || 60} seconds.`,
        };

        res.status(429).json(response);
        return;
      }

      // 6. Quota allowed: proceed to next handler
      next();
    } catch (error) {
      // Fail-open safely: log error and allow request to proceed
      console.error('Rate limit middleware error (failing open):', error);
      next();
    }
  };
}
