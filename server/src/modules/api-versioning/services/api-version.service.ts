import {
  IApiVersion,
  ICompatibilityResult,
  IVersionProvider,
  IVersionService,
  IVersionStatistics,
} from '../interfaces/api-version.interfaces';
import { VersionContext, VersionFilters } from '../types/api-version.types';
import { ApiVersion, CompatibilityMode, VersionStatus } from '../enums/api-version.enums';
import { globalVersionRegistry, VersionRegistry } from '../registry/version.registry';
import { DEFAULT_API_VERSION_CONFIG, IApiVersionConfig } from '../config/api-version.config';
import { ApiVersionUtil } from '../utils/api-version.util';

/**
 * Enterprise API Version Application Service Implementation (Module 29.3).
 *
 * Core business logic layer for API versioning and backward compatibility management.
 * Communicates strictly through IVersionProvider and VersionRegistry abstractions.
 * Handles version resolution, validation, compatibility evaluation, deprecation lifecycle, and statistics.
 */
export class ApiVersionService implements IVersionService {
  constructor(
    private readonly provider: IVersionProvider,
    private readonly registry: VersionRegistry = globalVersionRegistry,
    private readonly config: IApiVersionConfig = DEFAULT_API_VERSION_CONFIG
  ) {}

  /* ========================================================================
     PRIVATE HELPER METHODS
     ====================================================================== */

  /**
   * Validates version enum input safely.
   */
  private validateVersion(version?: string): ApiVersion {
    const enumVal = ApiVersionUtil.normalizeVersion(version);
    if (!enumVal) {
      throw new Error(`Invalid or unrecognized API version: '${version}'.`);
    }
    return enumVal;
  }

  /* ========================================================================
     PUBLIC SERVICE METHODS
     ====================================================================== */

  /**
   * Resolves target API version for an incoming request context.
   *
   * @param context Request context payload (url, path, query, headers).
   */
  async resolve(context: VersionContext): Promise<ApiVersion> {
    if (!context) {
      return this.config.defaultVersion;
    }
    return this.provider.resolve(context);
  }

  /**
   * Validates a version string format and status.
   *
   * @param version Target version string.
   */
  async validate(version: string): Promise<boolean> {
    if (!version) return false;
    return this.provider.validate(version);
  }

  /**
   * Evaluates backward compatibility between requested version and target endpoint version.
   *
   * @param requestedVersion Requested version string.
   * @param targetVersion Target endpoint version string.
   * @param mode Compatibility mode override (STRICT, LENIENT, LEGACY).
   */
  async compatibility(
    requestedVersion: string,
    targetVersion?: string,
    mode?: CompatibilityMode
  ): Promise<ICompatibilityResult> {
    const compMode = mode || this.config.compatibilityMode;
    const normRequested = ApiVersionUtil.normalizeVersion(requestedVersion);
    const normTarget = ApiVersionUtil.normalizeVersion(targetVersion) || this.config.defaultVersion;

    const warnings: string[] = [];

    // 1. Invalid or unrecognized requested version
    if (!normRequested) {
      const isStrict = compMode === CompatibilityMode.STRICT;
      return {
        compatible: !isStrict,
        requestedVersion: requestedVersion || 'unspecified',
        resolvedVersion: normTarget,
        mode: compMode,
        warnings: [`Requested version '${requestedVersion}' is not a valid API version.`],
      };
    }

    // 2. Check record status in registry
    const record = this.registry.getVersion(normRequested);
    let deprecationNotice: string | undefined;

    if (record) {
      if (record.status === VersionStatus.DEPRECATED || record.status === VersionStatus.SUNSET) {
        deprecationNotice = this.config.deprecationWarningMessage;
        warnings.push(`API version '${normRequested}' is deprecated and will be sunset soon.`);
      }

      if (record.status === VersionStatus.DISABLED && compMode === CompatibilityMode.STRICT) {
        return {
          compatible: false,
          requestedVersion: normRequested,
          resolvedVersion: normTarget,
          mode: compMode,
          warnings: [`API version '${normRequested}' is disabled. Access denied under STRICT mode.`],
        };
      }
    }

    // 3. Evaluate version comparison
    const cmp = ApiVersionUtil.compareVersions(normRequested, normTarget);

    if (cmp === 0) {
      return {
        compatible: true,
        requestedVersion: normRequested,
        resolvedVersion: normRequested,
        mode: compMode,
        warnings: warnings.length > 0 ? warnings : undefined,
        deprecationNotice,
      };
    }

    if (cmp < 0) {
      // Requested version is older than target version
      const isCompatible = compMode !== CompatibilityMode.STRICT;
      if (!isCompatible) {
        warnings.push(`Version '${normRequested}' is older than target version '${normTarget}'.`);
      }
      return {
        compatible: isCompatible,
        requestedVersion: normRequested,
        resolvedVersion: isCompatible ? normRequested : normTarget,
        mode: compMode,
        warnings: warnings.length > 0 ? warnings : undefined,
        deprecationNotice,
      };
    }

    // Requested version is newer than target version
    return {
      compatible: true,
      requestedVersion: normRequested,
      resolvedVersion: normRequested,
      mode: compMode,
      warnings: warnings.length > 0 ? warnings : undefined,
      deprecationNotice,
    };
  }

  /**
   * Retrieves list of active supported API versions.
   */
  async supportedVersions(): Promise<IApiVersion[]> {
    return this.provider.getSupportedVersions();
  }

  /**
   * Retrieves latest active production API version.
   */
  async latestVersion(): Promise<ApiVersion> {
    return this.provider.getLatestVersion();
  }

  /**
   * Enables an API version.
   *
   * @param version Target ApiVersion key.
   */
  async enable(version: ApiVersion): Promise<boolean> {
    const enumVal = this.validateVersion(version);
    return this.registry.enableVersion(enumVal);
  }

  /**
   * Disables an API version. Protects latestVersion from being disabled.
   *
   * @param version Target ApiVersion key.
   */
  async disable(version: ApiVersion): Promise<boolean> {
    const enumVal = this.validateVersion(version);
    const latest = await this.latestVersion();

    if (enumVal === latest) {
      throw new Error(`Cannot disable current latest production API version '${latest}'.`);
    }

    return this.registry.disableVersion(enumVal);
  }

  /**
   * Marks an API version as DEPRECATED with optional sunset date.
   *
   * @param version Target ApiVersion key.
   * @param sunsetDate Optional sunset end-of-life Date.
   */
  async deprecate(version: ApiVersion, sunsetDate?: Date): Promise<boolean> {
    const enumVal = this.validateVersion(version);
    return this.registry.deprecateVersion(enumVal, sunsetDate);
  }

  /**
   * Computes aggregate version metrics statistics.
   *
   * @param _filters Optional criteria filters.
   */
  async statistics(_filters?: VersionFilters): Promise<IVersionStatistics> {
    return this.provider.statistics();
  }
}
