import { Request, Response, NextFunction } from 'express';
import { IAnalyticsService } from '../interfaces/analytics-service.interface';
import { IAnalyticsResponse } from '../interfaces/analytics.interface';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { AnalyticsRequestDto } from '../dto/analytics-request.dto';
import { AnalyticsQueryTransformer } from '../utils/analytics-query-transformer.util';
import {
  AnalyticsGroupBy,
  AnalyticsPeriod,
  AnalyticsSortOrder,
  ReportType,
} from '../types/analytics.types';

/**
 * Analytics Controller (Module 23.5).
 *
 * Production-ready HTTP adapter for the Analytics & Reporting Engine REST API.
 *
 * Responsibilities (Single Responsibility Principle):
 *   1. Extract and sanitise raw query parameters from Express Request objects.
 *   2. Construct a typed AnalyticsRequestDto from sanitised string values.
 *   3. Delegate DTO → domain object transformation to AnalyticsQueryTransformer.
 *   4. Invoke the corresponding IAnalyticsService method via dependency injection.
 *   5. Wrap service results in the standardised ApiResponse<T> envelope.
 *   6. Return the appropriate HTTP status code.
 *   7. Forward all unhandled errors to Express next(error) global handler.
 *
 * Enforced constraints:
 *   — Zero business logic.
 *   — Zero MongoDB / repository access.
 *   — Zero direct imports of concrete service or repository classes.
 *   — All query parameter reads use String() casts to prevent prototype pollution.
 */
export class AnalyticsController {
  constructor(private readonly analyticsService: IAnalyticsService) {}

  /* --------------------------------------------------------------------------
     Private helpers
     -------------------------------------------------------------------------- */

  /**
   * Extracts a string query parameter safely.
   * Returns undefined when the parameter is absent or empty after trimming.
   */
  private qs(req: Request, key: string): string | undefined {
    const raw = req.query[key];
    if (raw === undefined || raw === null) return undefined;
    const value = String(raw).trim();
    return value.length > 0 ? value : undefined;
  }

  /**
   * Builds a typed AnalyticsRequestDto from Express query parameters.
   * Every field uses String() casting to prevent prototype-pollution attacks.
   * Optional fields resolve to undefined when absent so the transformer
   * can apply appropriate defaults.
   */
  private buildRequestDto(req: Request): AnalyticsRequestDto {
    return {
      dateFrom:   this.qs(req, 'dateFrom'),
      dateTo:     this.qs(req, 'dateTo'),
      period:     this.qs(req, 'period')     as AnalyticsPeriod  | undefined,
      metrics:    this.qs(req, 'metrics'),
      groupBy:    this.qs(req, 'groupBy')    as AnalyticsGroupBy | undefined,
      timezone:   this.qs(req, 'timezone'),
      reportType: this.qs(req, 'reportType') as ReportType       | undefined,
      categoryId: this.qs(req, 'categoryId'),
      brandId:    this.qs(req, 'brandId'),
      productId:  this.qs(req, 'productId'),
      status:     this.qs(req, 'status'),
      page:       this.qs(req, 'page'),
      limit:      this.qs(req, 'limit'),
      sortBy:     this.qs(req, 'sortBy'),
      sortOrder:  this.qs(req, 'sortOrder')  as AnalyticsSortOrder | undefined,
    };
  }

  /* --------------------------------------------------------------------------
     Endpoint handlers
     -------------------------------------------------------------------------- */

  /**
   * GET /api/v1/analytics
   *
   * General-purpose analytics query endpoint.
   * Resolves summary cards, chart data, and/or rankings based on the
   * requested `reportType` and `metrics` query parameters.
   *
   * Accepted query parameters (all optional):
   *   dateFrom, dateTo, period, metrics, groupBy, timezone, reportType,
   *   categoryId, brandId, productId, status, page, limit, sortBy, sortOrder
   *
   * Responds: 200 OK
   */
  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto     = this.buildRequestDto(req);
      const request = AnalyticsQueryTransformer.transform(dto);
      const result: IAnalyticsResponse = await this.analyticsService.getAnalytics(request);

      const response: ApiResponse<IAnalyticsResponse> = {
        success: true,
        message: 'Analytics data retrieved successfully.',
        data:    result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/summary
   *
   * Dashboard KPI summary endpoint.
   * Returns headline metric cards (total revenue, orders, customers, etc.)
   * enriched with period-over-period growth context.
   *
   * Accepted query parameters (all optional):
   *   dateFrom, dateTo, period, metrics, timezone,
   *   categoryId, brandId, productId, status
   *
   * Responds: 200 OK
   */
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto     = this.buildRequestDto(req);
      const request = AnalyticsQueryTransformer.transform(dto);
      const result: IAnalyticsResponse = await this.analyticsService.getSummaryCards(request);

      const response: ApiResponse<IAnalyticsResponse> = {
        success: true,
        message: 'Analytics summary retrieved successfully.',
        data:    result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/chart
   *
   * Time-series or categorical chart data endpoint.
   * Returns a chart data series grouped by the `groupBy` granularity
   * (HOUR / DAY / WEEK / MONTH / QUARTER / YEAR / CATEGORY).
   * Each data point is enriched with comparison period values and
   * change percentages for sparkline rendering.
   *
   * Accepted query parameters (all optional):
   *   dateFrom, dateTo, period, metrics, groupBy, timezone,
   *   categoryId, brandId, productId, status
   *
   * Responds: 200 OK
   */
  async getChart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto     = this.buildRequestDto(req);
      const request = AnalyticsQueryTransformer.transform(dto);
      const result: IAnalyticsResponse = await this.analyticsService.getChartData(request);

      const response: ApiResponse<IAnalyticsResponse> = {
        success: true,
        message: 'Analytics chart data retrieved successfully.',
        data:    result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/rankings
   *
   * Ranked entity list endpoint.
   * Returns a paginated list of top-performing entities (products, categories,
   * brands) ordered by the requested metric and sort direction.
   * Rank numbers account for the current page offset.
   *
   * Accepted query parameters (all optional):
   *   dateFrom, dateTo, period, metrics, timezone,
   *   categoryId, brandId, productId, status,
   *   page, limit, sortBy, sortOrder
   *
   * Responds: 200 OK
   */
  async getRankings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto     = this.buildRequestDto(req);
      const request = AnalyticsQueryTransformer.transform(dto);
      const result: IAnalyticsResponse = await this.analyticsService.getRankings(request);

      const response: ApiResponse<IAnalyticsResponse> = {
        success: true,
        message: 'Analytics rankings retrieved successfully.',
        data:    result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
