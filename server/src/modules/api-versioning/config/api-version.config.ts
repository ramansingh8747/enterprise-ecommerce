import {
  ApiVersion,
  CompatibilityMode,
  VersionResolutionStrategy,
} from '../enums/api-version.enums';
import {
  DEFAULT_API_VERSION,
  DEFAULT_COMPATIBILITY_MODE,
  DEFAULT_DEPRECATION_WARNING,
  DEFAULT_MEDIA_TYPE_PREFIX,
  DEFAULT_QUERY_PARAMETER,
  DEFAULT_VERSION_HEADER,
  DEFAULT_VERSION_RESOLUTION_STRATEGY,
  LATEST_API_VERSION,
} from '../constants/api-version.constants';

/**
 * Enterprise API Versioning Configuration Interface (Module 29.1 / 29.6).
 *
 * Options governing version resolution strategies, fallback versions,
 * warning/sunset headers, and backward compatibility modes.
 */
export interface IApiVersionConfig {
  /** Master switch enabling or disabling API versioning system-wide. */
  enabled: boolean;

  /** Default fallback API version if unspecified in request. */
  defaultVersion: ApiVersion;

  /** Current latest active production version. */
  latestVersion: ApiVersion;

  /** Primary strategy for resolving version from request (URL, HEADER, QUERY, MEDIA_TYPE). */
  resolutionStrategy: VersionResolutionStrategy;

  /** Backward compatibility mode (STRICT, LENIENT, LEGACY). */
  compatibilityMode: CompatibilityMode;

  /** Custom HTTP header name for version extraction/response. */
  headerName: string;

  /** Query parameter name for version override. */
  queryParameter: string;

  /** Vendor media type prefix for Accept header versioning. */
  mediaTypePrefix: string;

  /** Whether deprecation warning headers (Sunset / Warning) should be emitted. */
  enableDeprecationWarnings: boolean;

  /** Whether Warning headers are enabled. */
  enableWarningHeaders: boolean;

  /** Whether Sunset headers are enabled. */
  enableSunsetHeaders: boolean;

  /** Deprecation warning header text message. */
  deprecationWarningMessage: string;
}

/**
 * Default production-ready API versioning configuration with environment fallbacks.
 */
export const DEFAULT_API_VERSION_CONFIG: IApiVersionConfig = {
  enabled: process.env.API_VERSIONING_ENABLED !== 'false',
  defaultVersion:
    (process.env.API_DEFAULT_VERSION as ApiVersion) ||
    (process.env.API_VERSION_DEFAULT as ApiVersion) ||
    DEFAULT_API_VERSION,
  latestVersion:
    (process.env.API_LATEST_VERSION as ApiVersion) ||
    (process.env.API_VERSION_LATEST as ApiVersion) ||
    LATEST_API_VERSION,
  resolutionStrategy:
    (process.env.API_VERSION_STRATEGY as VersionResolutionStrategy) ||
    DEFAULT_VERSION_RESOLUTION_STRATEGY,
  compatibilityMode:
    (process.env.API_COMPATIBILITY_MODE as CompatibilityMode) ||
    (process.env.API_VERSION_COMPATIBILITY_MODE as CompatibilityMode) ||
    DEFAULT_COMPATIBILITY_MODE,
  headerName: process.env.API_VERSION_HEADER || DEFAULT_VERSION_HEADER,
  queryParameter: process.env.API_VERSION_QUERY_PARAM || DEFAULT_QUERY_PARAMETER,
  mediaTypePrefix: process.env.API_VERSION_MEDIA_TYPE_PREFIX || DEFAULT_MEDIA_TYPE_PREFIX,
  enableDeprecationWarnings:
    process.env.API_DEPRECATION_ENABLED !== 'false' &&
    process.env.API_VERSION_DEPRECATION_ENABLED !== 'false',
  enableWarningHeaders: process.env.API_WARNING_HEADERS !== 'false',
  enableSunsetHeaders: process.env.API_SUNSET_HEADERS !== 'false',
  deprecationWarningMessage:
    process.env.API_VERSION_DEPRECATION_WARNING || DEFAULT_DEPRECATION_WARNING,
};
