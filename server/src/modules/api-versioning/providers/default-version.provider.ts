import {
  IApiVersion,
  IVersionProvider,
  IVersionStatistics,
} from '../interfaces/api-version.interfaces';
import { VersionContext } from '../types/api-version.types';
import { ApiVersion, VersionStatus } from '../enums/api-version.enums';
import { globalVersionRegistry, VersionRegistry } from '../registry/version.registry';
import { VersionResolver } from '../resolver/version.resolver';
import { VersionStore } from '../storage/version.store';
import { DEFAULT_API_VERSION_CONFIG, IApiVersionConfig } from '../config/api-version.config';
import { ApiVersionUtil } from '../utils/api-version.util';

/**
 * Production Default Version Provider (Module 29.2).
 *
 * Implements IVersionProvider using VersionRegistry, VersionResolver, and VersionStore.
 */
export class DefaultVersionProvider implements IVersionProvider {
  private readonly store: VersionStore;
  private readonly registry: VersionRegistry;
  private readonly resolver: VersionResolver;

  constructor(
    store?: VersionStore,
    registry?: VersionRegistry,
    resolver?: VersionResolver,
    private readonly config: IApiVersionConfig = DEFAULT_API_VERSION_CONFIG
  ) {
    this.store = store || new VersionStore();
    this.registry = registry || globalVersionRegistry;
    this.resolver = resolver || new VersionResolver(config);
  }

  /**
   * Resolves target API version from request context.
   */
  async resolve(context: VersionContext): Promise<ApiVersion> {
    const resolved = this.resolver.resolve(context);
    this.store.recordResolution(resolved);
    return resolved;
  }

  /**
   * Validates whether a version string is active and supported.
   */
  async validate(version: string): Promise<boolean> {
    if (!version) return false;
    const enumVal = ApiVersionUtil.normalizeVersion(version);
    if (!enumVal) return false;

    const record = this.registry.getVersion(enumVal);
    if (!record) return false;

    return record.status === VersionStatus.ACTIVE || record.status === VersionStatus.DEPRECATED;
  }

  /**
   * Returns list of currently active supported API versions.
   */
  async getSupportedVersions(): Promise<IApiVersion[]> {
    return this.registry.listVersions().filter((v) => v.status === VersionStatus.ACTIVE);
  }

  /**
   * Returns latest active production version.
   */
  async getLatestVersion(): Promise<ApiVersion> {
    return this.config.latestVersion || ApiVersion.V2;
  }

  /**
   * Returns version statistics metrics.
   */
  async statistics(): Promise<IVersionStatistics> {
    return this.store.getStatistics();
  }
}
