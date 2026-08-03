import { Request, Response, NextFunction } from 'express';
import { IRateLimitResult, IRateLimitService, IRateLimitStatistics } from '../interfaces/rate-limit.interfaces';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { RateLimitContext } from '../types/rate-limit.types';
import { RateLimitScope } from '../enums/rate-limit.enums';

/**
 * Enterprise Rate Limit Controller (Module 28.5).
 *
 * Thin HTTP adapter exposing rate limit management and administration API endpoints.
 * Delegates execution strictly to IRateLimitService.
 * Contains ZERO business logic.
 */
export class RateLimitController {
  constructor(private readonly rateLimitService: IRateLimitService) {}

  /**
   * GET /api/v1/rate-limit
   * Evaluates current rate limit status for an identifier or caller IP.
   */
  async getRateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identifier = req.query.identifier ? String(req.query.identifier) : undefined;
      const scope = (req.query.scope as RateLimitScope) || RateLimitScope.IP;

      const context: RateLimitContext = {
        ip: identifier || req.ip || '127.0.0.1',
        route: req.baseUrl + req.path,
        method: req.method,
      };

      const result: IRateLimitResult = await this.rateLimitService.check(context, { scope });

      const response: ApiResponse<IRateLimitResult> = {
        success: true,
        message: 'Rate limit status evaluated successfully.',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/rate-limit/reset
   * Resets rate limit quota for a single identifier.
   */
  async reset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, scope } = req.body;
      const success = await this.rateLimitService.reset(identifier, scope as RateLimitScope);

      const response: ApiResponse<{ identifier: string; reset: boolean }> = {
        success,
        message: success
          ? `Rate limit reset successfully for identifier '${identifier}'.`
          : `Failed to reset rate limit for identifier '${identifier}'.`,
        data: { identifier, reset: success },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/rate-limit/reset-many
   * Batch resets rate limit quotas for multiple identifiers.
   */
  async resetMany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifiers, scope } = req.body;
      const summary = await this.rateLimitService.resetMany(identifiers, scope as RateLimitScope);

      const response: ApiResponse<{ resetCount: number; failedCount: number }> = {
        success: true,
        message: `Batch reset completed. ${summary.resetCount} keys reset, ${summary.failedCount} failed.`,
        data: summary,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/rate-limit/whitelist
   * Adds an identifier to the active whitelist.
   */
  async whitelist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier } = req.body;
      const success = await this.rateLimitService.whitelist(identifier);

      const response: ApiResponse<{ identifier: string; whitelisted: boolean }> = {
        success,
        message: `Identifier '${identifier}' added to rate limit whitelist successfully.`,
        data: { identifier, whitelisted: success },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/rate-limit/whitelist
   * Removes an identifier from the whitelist.
   */
  async removeWhitelist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier } = req.body;
      const success = await this.rateLimitService.removeWhitelist(identifier);

      const response: ApiResponse<{ identifier: string; removed: boolean }> = {
        success,
        message: success
          ? `Identifier '${identifier}' removed from whitelist.`
          : `Identifier '${identifier}' was not found in whitelist.`,
        data: { identifier, removed: success },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/rate-limit/blacklist
   * Adds an identifier to the penalty blacklist.
   */
  async blacklist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, duration } = req.body;
      const success = await this.rateLimitService.blacklist(identifier, duration);

      const response: ApiResponse<{ identifier: string; blacklisted: boolean }> = {
        success,
        message: `Identifier '${identifier}' added to rate limit blacklist successfully.`,
        data: { identifier, blacklisted: success },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/rate-limit/blacklist
   * Removes an identifier from the blacklist.
   */
  async removeBlacklist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier } = req.body;
      const success = await this.rateLimitService.removeBlacklist(identifier);

      const response: ApiResponse<{ identifier: string; removed: boolean }> = {
        success,
        message: success
          ? `Identifier '${identifier}' removed from blacklist.`
          : `Identifier '${identifier}' was not found in blacklist.`,
        data: { identifier, removed: success },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/rate-limit/statistics
   * Computes aggregate rate limit operational statistics metrics.
   */
  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats: IRateLimitStatistics = await this.rateLimitService.statistics();

      const response: ApiResponse<IRateLimitStatistics> = {
        success: true,
        message: 'Rate limit system statistics retrieved successfully.',
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
