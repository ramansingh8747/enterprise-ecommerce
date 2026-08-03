import { CompatibilityMode } from '../enums/api-version.enums';

/**
 * Compatibility Check Request DTO (Module 29.5).
 *
 * Payload for evaluating backward compatibility between source and target versions.
 */
export interface CompatibilityDto {
  /** Source requested version string (e.g. 'v1' or '1.0'). */
  sourceVersion: string;

  /** Target endpoint version string (e.g. 'v2'). */
  targetVersion?: string;

  /** Backward compatibility mode (STRICT, LENIENT, LEGACY). */
  compatibilityMode?: CompatibilityMode;
}
