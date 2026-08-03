import { ApiVersion, CompatibilityMode, VersionResolutionStrategy } from '../enums/api-version.enums';

/**
 * Enterprise API Versioning Module — Constants (Module 29.1).
 *
 * System defaults, maximum boundaries, HTTP header names, and fallback messages.
 */

/** Default system API version. */
export const DEFAULT_API_VERSION = ApiVersion.V1;

/** Latest production API version. */
export const LATEST_API_VERSION = ApiVersion.V2;

/** Default HTTP request/response header name for version negotiation. */
export const DEFAULT_VERSION_HEADER = 'X-API-Version';

/** Default query parameter key for version override. */
export const DEFAULT_QUERY_PARAMETER = 'version';

/** Default vendor media type prefix (Accept header versioning). */
export const DEFAULT_MEDIA_TYPE_PREFIX = 'application/vnd.company.v';

/** Default HTTP warning header for deprecated API version access. */
export const DEFAULT_DEPRECATION_WARNING = '299 - API Version Deprecated';

/** Maximum number of concurrently supported API versions. */
export const MAX_SUPPORTED_VERSIONS = 10;

/** Default resolution strategy. */
export const DEFAULT_VERSION_RESOLUTION_STRATEGY = VersionResolutionStrategy.URL;

/** Default compatibility mode. */
export const DEFAULT_COMPATIBILITY_MODE = CompatibilityMode.STRICT;
