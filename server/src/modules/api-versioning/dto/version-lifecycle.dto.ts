import { ApiVersion } from '../enums/api-version.enums';

/**
 * Version Lifecycle Action Types.
 */
export type VersionLifecycleAction = 'ENABLE' | 'DISABLE' | 'DEPRECATE';

/**
 * Version Lifecycle Request DTO (Module 29.5).
 *
 * Payload for managing API version lifecycle state transitions.
 */
export interface VersionLifecycleDto {
  /** Target ApiVersion enum key (v1, v2, v3). */
  version: ApiVersion;

  /** Lifecycle action operation (ENABLE, DISABLE, DEPRECATE). */
  action: VersionLifecycleAction;

  /** Reason for lifecycle transition. */
  reason?: string;

  /** Optional effective or sunset Date string. */
  effectiveDate?: string | Date;
}
