/**
 * Enterprise API Versioning Module — Shared Enumerations (Module 29.1).
 *
 * Centralized domain enums representing supported API versions, lifecycle statuses,
 * version resolution strategies, and backward compatibility modes.
 */

/**
 * Supported platform API versions.
 */
export enum ApiVersion {
  V1     = 'v1',
  V2     = 'v2',
  V3     = 'v3',
  LATEST = 'latest',
}

/**
 * Lifecycle execution status of an API version.
 */
export enum VersionStatus {
  ACTIVE     = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
  SUNSET     = 'SUNSET',
  DISABLED   = 'DISABLED',
}

/**
 * Request extraction strategy for resolving target API version.
 */
export enum VersionResolutionStrategy {
  URL        = 'URL',
  HEADER     = 'HEADER',
  QUERY      = 'QUERY',
  MEDIA_TYPE = 'MEDIA_TYPE',
}

/**
 * Backward compatibility enforcement modes.
 */
export enum CompatibilityMode {
  STRICT = 'STRICT',
  LENIENT = 'LENIENT',
  LEGACY  = 'LEGACY',
}
