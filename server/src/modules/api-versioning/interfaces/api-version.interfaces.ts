import {
  ApiVersion,
  CompatibilityMode,
  VersionResolutionStrategy,
  VersionStatus,
} from '../enums/api-version.enums';
import {
  VersionContext,
  VersionFilters,
  VersionMetrics,
} from '../types/api-version.types';

/**
 * Enterprise API Versioning Interfaces (Module 29.1).
 *
 * Core domain contracts defining API version descriptors, version metadata,
 * compatibility results, providers, resolvers, and application services.
 */

/**
 * API Version Entity Interface.
 */
export interface IApiVersion {
  /** ApiVersion enum value (v1, v2, v3). */
  version: ApiVersion;

  /** Numerical major version number (e.g. 1, 2, 3). */
  majorVersion: number;

  /** Current status (ACTIVE, DEPRECATED, SUNSET, DISABLED). */
  status: VersionStatus;

  /** Optional release date of version. */
  releaseDate?: Date;

  /** Optional deprecation date if status is DEPRECATED or SUNSET. */
  deprecationDate?: Date;

  /** Optional sunset (end-of-life) date. */
  sunsetDate?: Date;
}

/**
 * Detailed Metadata for an API version definition.
 */
export interface IVersionMetadata {
  version: ApiVersion;
  status: VersionStatus;
  isLatest: boolean;
  isSupported: boolean;
  isDeprecated: boolean;
  isSunset: boolean;
  deprecationNotice?: string;
  sunsetDate?: Date;
  documentationUrl?: string;
}

/**
 * Compatibility check result envelope.
 */
export interface ICompatibilityResult {
  compatible: boolean;
  requestedVersion: string;
  resolvedVersion: ApiVersion;
  mode: CompatibilityMode;
  warnings?: string[];
  deprecationNotice?: string;
}

/**
 * Aggregate version statistics metrics interface.
 */
export interface IVersionStatistics {
  supportedVersionsCount: number;
  deprecatedVersionsCount: number;
  latestVersion: ApiVersion;
  metrics: VersionMetrics;
}

/**
 * Version Resolver Interface abstraction for request resolution strategies.
 */
export interface IVersionResolver {
  strategy: VersionResolutionStrategy;
  resolve(context: VersionContext): ApiVersion | null;
}

/**
 * Storage / Registry Provider interface for API Versions (DIP).
 */
export interface IVersionProvider {
  /**
   * Resolves target version from request context.
   *
   * @param context Request context payload.
   */
  resolve(context: VersionContext): Promise<ApiVersion>;

  /**
   * Validates whether a version string is active and supported.
   *
   * @param version Version string or enum.
   */
  validate(version: string): Promise<boolean>;

  /**
   * Returns list of currently active supported versions.
   */
  getSupportedVersions(): Promise<IApiVersion[]>;

  /**
   * Returns latest active production version.
   */
  getLatestVersion(): Promise<ApiVersion>;

  /**
   * Returns version statistics.
   */
  statistics(): Promise<IVersionStatistics>;
}

/**
 * API Version Application Service Interface.
 */
export interface IVersionService {
  /**
   * Resolves API version for request context.
   *
   * @param context Request context payload.
   */
  resolve(context: VersionContext): Promise<ApiVersion>;

  /**
   * Validates a version string format and status.
   *
   * @param version Target version string.
   */
  validate(version: string): Promise<boolean>;

  /**
   * Performs backward compatibility evaluation.
   *
   * @param requestedVersion Requested version string.
   * @param targetVersion Target endpoint version string.
   * @param mode Compatibility mode override.
   */
  compatibility(
    requestedVersion: string,
    targetVersion?: string,
    mode?: CompatibilityMode
  ): Promise<ICompatibilityResult>;

  /**
   * Retrieves list of supported API versions.
   */
  supportedVersions(): Promise<IApiVersion[]>;

  /**
   * Retrieves current latest active production API version.
   */
  latestVersion(): Promise<ApiVersion>;

  /**
   * Enables an API version.
   *
   * @param version Target ApiVersion key.
   */
  enable(version: ApiVersion): Promise<boolean>;

  /**
   * Disables an API version.
   *
   * @param version Target ApiVersion key.
   */
  disable(version: ApiVersion): Promise<boolean>;

  /**
   * Marks an API version as deprecated.
   *
   * @param version Target ApiVersion key.
   * @param sunsetDate Optional sunset end-of-life Date.
   */
  deprecate(version: ApiVersion, sunsetDate?: Date): Promise<boolean>;

  /**
   * Computes aggregate version metrics statistics.
   *
   * @param filters Optional criteria filters.
   */
  statistics(filters?: VersionFilters): Promise<IVersionStatistics>;
}
