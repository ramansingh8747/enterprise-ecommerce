import { Request, Response, NextFunction } from 'express';
import {
  IApiVersion,
  ICompatibilityResult,
  IVersionService,
  IVersionStatistics,
} from '../interfaces/api-version.interfaces';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { ApiVersion, CompatibilityMode } from '../enums/api-version.enums';

/**
 * Enterprise API Version Controller (Module 29.5).
 *
 * Thin HTTP adapter exposing version management and administration REST API endpoints.
 * Delegates execution strictly to IVersionService.
 * Contains ZERO business logic.
 */
export class ApiVersionController {
  constructor(private readonly versionService: IVersionService) {}

  /**
   * GET /api/v1/api-versions
   * Returns list of currently active supported API versions.
   */
  async getSupportedVersions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const versions: IApiVersion[] = await this.versionService.supportedVersions();

      const response: ApiResponse<IApiVersion[]> = {
        success: true,
        message: 'Supported API versions retrieved successfully.',
        data: versions,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/api-versions/latest
   * Returns current latest production API version.
   */
  async getLatestVersion(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const latest: ApiVersion = await this.versionService.latestVersion();

      const response: ApiResponse<{ latestVersion: ApiVersion }> = {
        success: true,
        message: 'Latest API version retrieved successfully.',
        data: { latestVersion: latest },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/api-versions/statistics
   * Computes aggregate version operational statistics metrics.
   */
  async getStatistics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats: IVersionStatistics = await this.versionService.statistics();

      const response: ApiResponse<IVersionStatistics> = {
        success: true,
        message: 'API version statistics retrieved successfully.',
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/api-versions/validate
   * Validates whether a version string is active and supported.
   */
  async validateVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { version } = req.body;
      const isValid = await this.versionService.validate(version);

      const response: ApiResponse<{ version: string; valid: boolean }> = {
        success: true,
        message: isValid
          ? `Version '${version}' is valid and active.`
          : `Version '${version}' is invalid or unsupported.`,
        data: { version, valid: isValid },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/api-versions/compatibility
   * Evaluates backward compatibility between source and target versions.
   */
  async checkCompatibility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sourceVersion, targetVersion, compatibilityMode } = req.body;

      const result: ICompatibilityResult = await this.versionService.compatibility(
        sourceVersion,
        targetVersion,
        compatibilityMode as CompatibilityMode
      );

      const response: ApiResponse<ICompatibilityResult> = {
        success: true,
        message: 'Compatibility check evaluated successfully.',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/api-versions/lifecycle
   * Performs lifecycle action operations (ENABLE, DISABLE, DEPRECATE).
   */
  async handleLifecycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { version, action, effectiveDate } = req.body;
      const targetVersion = version as ApiVersion;
      let success = false;

      switch (action) {
        case 'ENABLE':
          success = await this.versionService.enable(targetVersion);
          break;
        case 'DISABLE':
          success = await this.versionService.disable(targetVersion);
          break;
        case 'DEPRECATE':
          const sunset = effectiveDate ? new Date(effectiveDate) : undefined;
          success = await this.versionService.deprecate(targetVersion, sunset);
          break;
        default:
          throw new Error(`Unsupported lifecycle action: '${action}'.`);
      }

      const response: ApiResponse<{ version: ApiVersion; action: string; success: boolean }> = {
        success,
        message: `Lifecycle action '${action}' applied to version '${version}' successfully.`,
        data: { version: targetVersion, action, success },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
