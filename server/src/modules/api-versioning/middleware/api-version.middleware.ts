import { Request, Response, NextFunction, RequestHandler } from 'express';
import { IVersionService } from '../interfaces/api-version.interfaces';
import { apiVersionService as defaultService } from '../../../container';
import { ApiVersion } from '../enums/api-version.enums';
import { VersionContext } from '../types/api-version.types';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { DEFAULT_VERSION_HEADER } from '../constants/api-version.constants';

/**
 * Extend Express Request interface to expose resolved apiVersion and metadata.
 */
declare global {
  namespace Express {
    interface Request {
      apiVersion?: ApiVersion;
      versionMetadata?: {
        resolvedVersion: ApiVersion;
        requestedVersion: string;
        isDeprecated: boolean;
        deprecationNotice?: string;
      };
    }
  }
}

/**
 * Production API Versioning Express Middleware Factory (Module 29.4).
 *
 * Intercepts incoming Express HTTP requests, extracts version indicator from configured
 * sources (URL path, X-API-Version header, ?version= query, Accept header), evaluates
 * backward compatibility, sets standard response headers, and attaches version metadata to req.
 *
 * @param service Optional IVersionService override (defaults to container singleton).
 */
export function createApiVersionMiddleware(
  service: IVersionService = defaultService
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Build VersionContext from Express request
      const context: VersionContext = {
        url: req.originalUrl || req.url,
        path: req.path,
        query: req.query as Record<string, string | string[] | undefined>,
        headers: req.headers as Record<string, string | string[] | undefined>,
        method: req.method,
      };

      // 2. Resolve version via IVersionService
      const resolvedVersion = await service.resolve(context);

      // 3. Evaluate backward compatibility
      const rawRequested =
        (req.headers[DEFAULT_VERSION_HEADER.toLowerCase()] as string) ||
        (req.query.version as string) ||
        String(resolvedVersion);

      const compResult = await service.compatibility(rawRequested, resolvedVersion);

      // 4. Attach resolved version and metadata to Express Request
      req.apiVersion = resolvedVersion;
      req.versionMetadata = {
        resolvedVersion,
        requestedVersion: rawRequested,
        isDeprecated: compResult.deprecationNotice !== undefined,
        deprecationNotice: compResult.deprecationNotice,
      };

      // 5. Set standard API Versioning HTTP Response Headers
      res.setHeader(DEFAULT_VERSION_HEADER, String(resolvedVersion));
      res.setHeader('API-Supported-Versions', 'v1, v2');
      res.setHeader('API-Latest-Version', 'v2');

      if (compResult.deprecationNotice) {
        res.setHeader('Warning', compResult.deprecationNotice);
        res.setHeader('Deprecation', 'true');
      }

      // 6. Handle incompatible version reject
      if (!compResult.compatible) {
        const response: ApiResponse<null> = {
          success: false,
          message: `Unsupported or incompatible API version requested: '${rawRequested}'.`,
        };

        res.status(400).json(response);
        return;
      }

      // 7. Proceed to next middleware / route handler
      next();
    } catch (error) {
      // Fail-open safely: log error and proceed with default execution
      console.error('API version middleware error (failing open):', error);
      next();
    }
  };
}
