import { ApiVersion, VersionResolutionStrategy } from '../enums/api-version.enums';

/**
 * Version Query Request DTO (Module 29.5).
 *
 * Query parameters for searching API version descriptors and metrics.
 */
export interface VersionQueryDto {
  /** Target ApiVersion enum or string filter. */
  version?: ApiVersion | string;

  /** Resolution strategy filter. */
  strategy?: VersionResolutionStrategy;

  /** Whether to include deprecated versions in list. */
  includeDeprecated?: boolean;

  /** Whether to include disabled versions in list. */
  includeDisabled?: boolean;
}
