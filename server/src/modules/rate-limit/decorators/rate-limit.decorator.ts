import { IRateLimitPolicy } from '../policies/rate-limit.policy';
import { globalRateLimitPolicyRegistry, RateLimitPolicyRegistry } from '../policies/policy.registry';

/**
 * Enterprise Rate Limit Decorator Utility Helpers (Module 28.4).
 *
 * Provides metadata resolution and policy lookup helper methods for controller
 * or middleware integration.
 */
export class RateLimitDecoratorUtil {
  /**
   * Predicate determining whether an incoming request object should undergo rate limiting.
   *
   * @param req Express request or request payload object.
   */
  static shouldRateLimit(req?: { path?: string; headers?: Record<string, unknown> }): boolean {
    if (!req) return true;
    // Example: skip health check or internal metrics routes if configured
    if (req.path === '/health' || req.path === '/metrics') {
      return false;
    }
    return true;
  }

  /**
   * Resolves an IRateLimitPolicy instance from the policy registry.
   *
   * @param policyName Policy name string.
   * @param registry Registry instance. Defaults to globalRateLimitPolicyRegistry.
   */
  static resolvePolicy(
    policyName?: string,
    registry: RateLimitPolicyRegistry = globalRateLimitPolicyRegistry
  ): IRateLimitPolicy | null {
    if (!policyName) return null;
    return registry.getPolicy(policyName);
  }

  /**
   * Formats structured policy metadata payload.
   *
   * @param policy Target policy object.
   */
  static buildRateLimitMetadata(policy: IRateLimitPolicy): Record<string, unknown> {
    return {
      policyName: policy.name,
      maxRequests: policy.maxRequests,
      windowMs: policy.windowMs,
      scope: policy.scope,
      strategy: policy.strategy,
      throttleAction: policy.throttleAction,
    };
  }
}
