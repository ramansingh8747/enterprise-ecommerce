import { ApiVersion, VersionStatus } from '../enums/api-version.enums';

/**
 * Enterprise API Versioning Types (Module 29.1).
 *
 * Domain types for filters, summary metrics, request contexts, and search options.
 */

/** Criteria filters for version queries. */
export interface VersionFilters {
  status?: VersionStatus;
  version?: ApiVersion;
  deprecated?: boolean;
  search?: string;
}

/** Operational metrics metrics container for API version usage. */
export interface VersionMetrics {
  totalRequests: number;
  requestsByVersion: Record<string, number>;
  deprecatedAccessCount: number;
  sunsetAccessCount: number;
}

/** Overview data structure summarizing active API versions. */
export interface VersionSummary {
  activeVersions: ApiVersion[];
  deprecatedVersions: ApiVersion[];
  sunsetVersions: ApiVersion[];
  latestVersion: ApiVersion;
  metrics: VersionMetrics;
}

/** Incoming request context payload for version resolution. */
export interface VersionContext {
  url?: string;
  path?: string;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
}

/** Standard pagination options for version administration queries. */
export interface VersionPagination {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/** Search options for version lookup. */
export interface VersionSearchOptions {
  query?: string;
  status?: VersionStatus;
}
