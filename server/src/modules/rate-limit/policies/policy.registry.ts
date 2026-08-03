import {
  ADMIN_API_POLICY,
  FILE_UPLOAD_POLICY,
  IRateLimitPolicy,
  PUBLIC_API_POLICY,
  STRICT_AUTH_POLICY,
  WEBHOOK_POLICY,
} from './rate-limit.policy';

/**
 * Enterprise Rate Limit Policy Registry (Module 28.4).
 *
 * Central registry mapping policy names to IRateLimitPolicy instances.
 * Pre-populates default system policies and supports dynamic policy registration.
 */
export class RateLimitPolicyRegistry {
  private readonly policies = new Map<string, IRateLimitPolicy>();

  constructor() {
    this.registerPolicy(STRICT_AUTH_POLICY);
    this.registerPolicy(PUBLIC_API_POLICY);
    this.registerPolicy(ADMIN_API_POLICY);
    this.registerPolicy(WEBHOOK_POLICY);
    this.registerPolicy(FILE_UPLOAD_POLICY);
  }

  /**
   * Registers a rate limit policy definition.
   *
   * @param policy Target IRateLimitPolicy object.
   */
  registerPolicy(policy: IRateLimitPolicy): void {
    if (!policy || !policy.name) {
      throw new Error('Cannot register rate limit policy without a valid name.');
    }
    const nameKey = policy.name.trim().toUpperCase();
    this.policies.set(nameKey, policy);
  }

  /**
   * Unregisters a policy by name.
   *
   * @param policyName Policy name string.
   */
  unregisterPolicy(policyName: string): boolean {
    const nameKey = policyName.trim().toUpperCase();
    return this.policies.delete(nameKey);
  }

  /**
   * Resolves a policy by name.
   *
   * @param policyName Policy name string.
   */
  getPolicy(policyName: string): IRateLimitPolicy | null {
    const nameKey = policyName.trim().toUpperCase();
    return this.policies.get(nameKey) || null;
  }

  /**
   * Checks whether a policy is registered.
   *
   * @param policyName Policy name string.
   */
  hasPolicy(policyName: string): boolean {
    const nameKey = policyName.trim().toUpperCase();
    return this.policies.has(nameKey);
  }

  /**
   * Returns list of all currently registered policy definitions.
   */
  listPolicies(): IRateLimitPolicy[] {
    return Array.from(this.policies.values());
  }
}

/** Global singleton instance of RateLimitPolicyRegistry */
export const globalRateLimitPolicyRegistry = new RateLimitPolicyRegistry();
