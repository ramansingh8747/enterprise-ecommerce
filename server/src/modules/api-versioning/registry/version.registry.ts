import { ApiVersion, VersionStatus } from '../enums/api-version.enums';
import { IApiVersion } from '../interfaces/api-version.interfaces';
import { VersionStore } from '../storage/version.store';

/**
 * Enterprise API Version Registry (Module 29.2).
 *
 * Registry managing lifecycle states of supported platform API versions.
 * Supports registration, deprecation transitions, status toggles, and metadata lookups.
 */
export class VersionRegistry {
  constructor(private readonly store: VersionStore = new VersionStore()) {}

  /**
   * Registers a new API version definition.
   *
   * @param record Target IApiVersion object.
   */
  registerVersion(record: IApiVersion): void {
    if (!record || !record.version) {
      throw new Error('Cannot register API version without a valid version key.');
    }
    this.store.setVersion(record);
  }

  /**
   * Unregisters an API version from registry.
   *
   * @param version Target ApiVersion key.
   */
  unregisterVersion(version: ApiVersion): boolean {
    return this.store.deleteVersion(version);
  }

  /**
   * Marks an API version as ACTIVE.
   *
   * @param version Target ApiVersion key.
   */
  enableVersion(version: ApiVersion): boolean {
    const record = this.store.getVersion(version);
    if (!record) return false;
    record.status = VersionStatus.ACTIVE;
    this.store.setVersion(record);
    return true;
  }

  /**
   * Marks an API version as DISABLED.
   *
   * @param version Target ApiVersion key.
   */
  disableVersion(version: ApiVersion): boolean {
    const record = this.store.getVersion(version);
    if (!record) return false;
    record.status = VersionStatus.DISABLED;
    this.store.setVersion(record);
    return true;
  }

  /**
   * Marks an API version as DEPRECATED with optional sunset date.
   *
   * @param version Target ApiVersion key.
   * @param sunsetDate Optional end-of-life Date.
   */
  deprecateVersion(version: ApiVersion, sunsetDate?: Date): boolean {
    const record = this.store.getVersion(version);
    if (!record) return false;
    record.status = VersionStatus.DEPRECATED;
    record.deprecationDate = new Date();
    if (sunsetDate) record.sunsetDate = sunsetDate;
    this.store.setVersion(record);
    return true;
  }

  /**
   * Retrieves an API version definition by key.
   *
   * @param version Target ApiVersion key.
   */
  getVersion(version: ApiVersion): IApiVersion | null {
    return this.store.getVersion(version);
  }

  /**
   * Returns list of all registered API versions.
   */
  listVersions(): IApiVersion[] {
    return this.store.listVersions();
  }
}

/** Global singleton instance of VersionRegistry */
export const globalVersionRegistry = new VersionRegistry();
