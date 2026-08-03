import { ApiVersion, CompatibilityMode, VersionStatus } from '../enums/api-version.enums';
import { IApiVersion } from '../interfaces/api-version.interfaces';
import { ApiVersionUtil } from '../utils/api-version.util';

/**
 * Enterprise Version Matcher (Module 29.4).
 *
 * Implements version matching logic for exact matches, compatibility fallbacks,
 * deprecated route matching, and strict mode evaluations.
 */
export class VersionMatcher {
  /**
   * Evaluates exact version match.
   *
   * @param requested Version requested by client.
   * @param target Target route version.
   */
  static matchExact(requested: ApiVersion, target: ApiVersion): boolean {
    return requested === target;
  }

  /**
   * Evaluates compatibility match based on mode.
   *
   * @param requested Version requested by client.
   * @param target Target route version.
   * @param mode CompatibilityMode enum (STRICT, LENIENT, LEGACY).
   */
  static matchCompatibility(
    requested: ApiVersion,
    target: ApiVersion,
    mode: CompatibilityMode = CompatibilityMode.STRICT
  ): boolean {
    if (requested === target) return true;

    if (mode === CompatibilityMode.LENIENT || mode === CompatibilityMode.LEGACY) {
      // Allow fallback if requested version is newer or equal major version
      const cmp = ApiVersionUtil.compareVersions(requested, target);
      return cmp >= 0;
    }

    return false;
  }

  /**
   * Evaluates whether a route matching candidate is active or acceptable under status rules.
   *
   * @param record Version descriptor object.
   * @param mode Compatibility mode.
   */
  static isMatchableStatus(record: IApiVersion, mode: CompatibilityMode): boolean {
    if (record.status === VersionStatus.ACTIVE) return true;
    if (record.status === VersionStatus.DEPRECATED) return true;
    if (record.status === VersionStatus.DISABLED && mode === CompatibilityMode.LEGACY) return true;
    return false;
  }
}
