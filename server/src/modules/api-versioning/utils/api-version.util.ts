import { ApiVersion } from '../enums/api-version.enums';
import { DEFAULT_VERSION_HEADER } from '../constants/api-version.constants';

/**
 * Enterprise API Versioning Utility Helpers (Module 29.1).
 *
 * Reusable functions for version string normalization, semantic version parsing,
 * major version comparison, format validation, and HTTP response header generation.
 */
export class ApiVersionUtil {
  /**
   * Normalizes a raw version string to ApiVersion enum or null if invalid.
   * Accepts: 'v1', 'V1', '1', '1.0', 'latest', 'LATEST'.
   *
   * @param rawVersion Raw version input string.
   */
  static normalizeVersion(rawVersion?: string): ApiVersion | null {
    if (!rawVersion || typeof rawVersion !== 'string') return null;
    const clean = rawVersion.trim().toLowerCase().replace(/^v/, '');

    if (clean === '1' || clean === '1.0' || clean === 'v1') return ApiVersion.V1;
    if (clean === '2' || clean === '2.0' || clean === 'v2') return ApiVersion.V2;
    if (clean === '3' || clean === '3.0' || clean === 'v3') return ApiVersion.V3;
    if (clean === 'latest') return ApiVersion.LATEST;

    return null;
  }

  /**
   * Validates whether a version string matches recognized format patterns.
   *
   * @param versionStr Target version string.
   */
  static validateVersionFormat(versionStr?: string): boolean {
    return this.normalizeVersion(versionStr) !== null;
  }

  /**
   * Parses a semantic version string into major, minor, patch numbers.
   *
   * @param versionStr Target version string (e.g. 'v1.2.3' or '2.0').
   */
  static parseVersion(versionStr: string): { major: number; minor: number; patch: number } | null {
    if (!versionStr || typeof versionStr !== 'string') return null;
    const clean = versionStr.trim().toLowerCase().replace(/^v/, '');
    const parts = clean.split('.').map((p) => parseInt(p, 10));

    if (parts.some((p) => isNaN(p))) return null;

    return {
      major: parts[0] || 1,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
    };
  }

  /**
   * Compares two version strings semantically.
   *
   * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2.
   */
  static compareVersions(v1: string, v2: string): number {
    const p1 = this.parseVersion(v1);
    const p2 = this.parseVersion(v2);

    if (!p1 || !p2) return 0;

    if (p1.major !== p2.major) return p1.major > p2.major ? 1 : -1;
    if (p1.minor !== p2.minor) return p1.minor > p2.minor ? 1 : -1;
    if (p1.patch !== p2.patch) return p1.patch > p2.patch ? 1 : -1;

    return 0;
  }

  /**
   * Formats HTTP response headers for version negotiation.
   *
   * @param version ApiVersion enum or string.
   * @param headerName Header key name. Defaults to DEFAULT_VERSION_HEADER ('X-API-Version').
   */
  static buildVersionHeader(
    version: ApiVersion | string,
    headerName: string = DEFAULT_VERSION_HEADER
  ): Record<string, string> {
    return {
      [headerName]: String(version),
    };
  }
}
