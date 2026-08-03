import {
  IApiVersion,
  IVersionProvider,
  IVersionStatistics,
} from '../interfaces/api-version.interfaces';
import { VersionContext } from '../types/api-version.types';
import { ApiVersion, VersionStatus } from '../enums/api-version.enums';
import { LATEST_API_VERSION } from '../constants/api-version.constants';

/**
 * Enterprise Abstract API Version Provider Base Class (Module 29.1).
 *
 * Base class defining the provider contract for API version management and resolution.
 * Implements IVersionProvider with default fallback hooks.
 */
export abstract class AbstractVersionProvider implements IVersionProvider {
  /**
   * Resolves target version from request context.
   */
  async resolve(_context: VersionContext): Promise<ApiVersion> {
    return ApiVersion.V1;
  }

  /**
   * Validates whether a version string is active and supported.
   */
  async validate(version: string): Promise<boolean> {
    if (!version) return false;
    const norm = String(version).trim().toLowerCase();
    return Object.values(ApiVersion).includes(norm as ApiVersion);
  }

  /**
   * Returns list of currently supported API versions.
   */
  async getSupportedVersions(): Promise<IApiVersion[]> {
    return [
      {
        version: ApiVersion.V1,
        majorVersion: 1,
        status: VersionStatus.ACTIVE,
        releaseDate: new Date('2024-01-01'),
      },
      {
        version: ApiVersion.V2,
        majorVersion: 2,
        status: VersionStatus.ACTIVE,
        releaseDate: new Date('2025-01-01'),
      },
    ];
  }

  /**
   * Returns latest active production version.
   */
  async getLatestVersion(): Promise<ApiVersion> {
    return LATEST_API_VERSION;
  }

  /**
   * Returns aggregate statistics metrics.
   */
  async statistics(): Promise<IVersionStatistics> {
    return {
      supportedVersionsCount: 2,
      deprecatedVersionsCount: 0,
      latestVersion: LATEST_API_VERSION,
      metrics: {
        totalRequests: 0,
        requestsByVersion: { v1: 0, v2: 0 },
        deprecatedAccessCount: 0,
        sunsetAccessCount: 0,
      },
    };
  }
}
