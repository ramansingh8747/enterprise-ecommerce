import { ApiVersion, VersionStatus } from '../enums/api-version.enums';
import { IApiVersion, IVersionStatistics } from '../interfaces/api-version.interfaces';
import { LATEST_API_VERSION } from '../constants/api-version.constants';

/**
 * Enterprise Production In-Memory Version Store (Module 29.2).
 *
 * Maintains supported API version records, lifecycle statuses (ACTIVE, DEPRECATED, SUNSET, DISABLED),
 * version metadata lookup optimizations, and operational metrics.
 */
export class VersionStore {
  private readonly versions = new Map<ApiVersion, IApiVersion>();
  private totalResolutions = 0;
  private resolutionsByVersion: Record<string, number> = {};

  constructor() {
    // Pre-populate default supported versions
    this.setVersion({
      version: ApiVersion.V1,
      majorVersion: 1,
      status: VersionStatus.ACTIVE,
      releaseDate: new Date('2024-01-01'),
    });
    this.setVersion({
      version: ApiVersion.V2,
      majorVersion: 2,
      status: VersionStatus.ACTIVE,
      releaseDate: new Date('2025-01-01'),
    });
  }

  /**
   * Sets or updates an API version record in store.
   *
   * @param record Target IApiVersion object.
   */
  setVersion(record: IApiVersion): void {
    if (!record || !record.version) return;
    this.versions.set(record.version, { ...record });
  }

  /**
   * Retrieves an API version record from store.
   *
   * @param version Target ApiVersion key.
   */
  getVersion(version: ApiVersion): IApiVersion | null {
    const record = this.versions.get(version);
    return record ? { ...record } : null;
  }

  /**
   * Removes an API version record from store.
   *
   * @param version Target ApiVersion key.
   */
  deleteVersion(version: ApiVersion): boolean {
    return this.versions.delete(version);
  }

  /**
   * Returns list of all stored API versions.
   */
  listVersions(): IApiVersion[] {
    return Array.from(this.versions.values());
  }

  /**
   * Checks whether a version key exists in store.
   *
   * @param version Target ApiVersion key.
   */
  hasVersion(version: ApiVersion): boolean {
    return this.versions.has(version);
  }

  /**
   * Registers a resolution hit count for version statistics.
   *
   * @param version Resolved ApiVersion.
   */
  recordResolution(version: ApiVersion): void {
    this.totalResolutions++;
    const key = String(version);
    this.resolutionsByVersion[key] = (this.resolutionsByVersion[key] || 0) + 1;
  }

  /**
   * Returns operational version store statistics metrics.
   */
  getStatistics(): IVersionStatistics {
    const list = Array.from(this.versions.values());
    const supported = list.filter((v) => v.status === VersionStatus.ACTIVE);
    const deprecated = list.filter(
      (v) => v.status === VersionStatus.DEPRECATED || v.status === VersionStatus.SUNSET
    );

    return {
      supportedVersionsCount: supported.length,
      deprecatedVersionsCount: deprecated.length,
      latestVersion: LATEST_API_VERSION,
      metrics: {
        totalRequests: this.totalResolutions,
        requestsByVersion: { ...this.resolutionsByVersion },
        deprecatedAccessCount: deprecated.reduce(
          (acc, v) => acc + (this.resolutionsByVersion[String(v.version)] || 0),
          0
        ),
        sunsetAccessCount: list
          .filter((v) => v.status === VersionStatus.SUNSET)
          .reduce((acc, v) => acc + (this.resolutionsByVersion[String(v.version)] || 0), 0),
      },
    };
  }
}
