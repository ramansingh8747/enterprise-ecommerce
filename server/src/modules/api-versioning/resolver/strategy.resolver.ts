import { ApiVersion, VersionResolutionStrategy } from '../enums/api-version.enums';
import { IVersionResolver } from '../interfaces/api-version.interfaces';
import { VersionContext } from '../types/api-version.types';
import { ApiVersionUtil } from '../utils/api-version.util';
import { DEFAULT_API_VERSION_CONFIG, IApiVersionConfig } from '../config/api-version.config';

/**
 * Enterprise Strategy Resolver (Module 29.2).
 *
 * Implements IVersionResolver for specific resolution strategies (URL, HEADER, QUERY, MEDIA_TYPE).
 */
export class StrategyResolver implements IVersionResolver {
  constructor(
    public readonly strategy: VersionResolutionStrategy,
    private readonly config: IApiVersionConfig = DEFAULT_API_VERSION_CONFIG
  ) {}

  /**
   * Resolves ApiVersion from VersionContext according to configured strategy.
   *
   * @param context Request context payload (url, path, query, headers).
   */
  resolve(context: VersionContext): ApiVersion | null {
    if (!context) return null;

    switch (this.strategy) {
      case VersionResolutionStrategy.URL:
        return this.resolveFromUrl(context);
      case VersionResolutionStrategy.HEADER:
        return this.resolveFromHeader(context);
      case VersionResolutionStrategy.QUERY:
        return this.resolveFromQuery(context);
      case VersionResolutionStrategy.MEDIA_TYPE:
        return this.resolveFromMediaType(context);
      default:
        return null;
    }
  }

  /**
   * Extracts version from URL path e.g. '/api/v1/products' -> 'v1'.
   */
  private resolveFromUrl(context: VersionContext): ApiVersion | null {
    const targetPath = context.path || context.url || '';
    if (!targetPath) return null;

    const match = targetPath.match(/\/api\/(v[0-9]+|latest)\//i);
    if (match && match[1]) {
      return ApiVersionUtil.normalizeVersion(match[1]);
    }
    return null;
  }

  /**
   * Extracts version from HTTP headers e.g. 'X-API-Version: v2'.
   */
  private resolveFromHeader(context: VersionContext): ApiVersion | null {
    if (!context.headers) return null;
    const headerKey = this.config.headerName.toLowerCase();
    const rawValue = context.headers[headerKey] || context.headers[this.config.headerName];

    if (!rawValue) return null;
    const val = Array.isArray(rawValue) ? rawValue[0] : String(rawValue);
    return ApiVersionUtil.normalizeVersion(val);
  }

  /**
   * Extracts version from query parameter e.g. '?version=v1'.
   */
  private resolveFromQuery(context: VersionContext): ApiVersion | null {
    if (!context.query) return null;
    const paramKey = this.config.queryParameter;
    const rawValue = context.query[paramKey];

    if (!rawValue) return null;
    const val = Array.isArray(rawValue) ? rawValue[0] : String(rawValue);
    return ApiVersionUtil.normalizeVersion(val);
  }

  /**
   * Extracts version from Accept header vendor media type e.g. 'application/vnd.company.v2+json'.
   */
  private resolveFromMediaType(context: VersionContext): ApiVersion | null {
    if (!context.headers) return null;
    const acceptHeader = context.headers['accept'] || context.headers['Accept'];
    if (!acceptHeader) return null;

    const acceptStr = Array.isArray(acceptHeader) ? acceptHeader[0] : String(acceptHeader);
    const prefix = this.config.mediaTypePrefix.toLowerCase();
    const match = acceptStr.toLowerCase().match(new RegExp(`${prefix}([0-9]+|latest)`, 'i'));

    if (match && match[1]) {
      return ApiVersionUtil.normalizeVersion(`v${match[1]}`);
    }
    return null;
  }
}
