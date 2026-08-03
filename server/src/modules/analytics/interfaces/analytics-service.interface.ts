import {
  AnalyticsMetric,
  AnalyticsGroupBy,
  AnalyticsPeriod,
  AnalyticsSortOrder,
  AnalyticsExportFormat,
  ReportType,
} from '../types/analytics.types';
import { IAnalyticsRequest } from './analytics.interface';
import { IAnalyticsResponse } from './analytics.interface';

/**
 * Analytics Service Application Boundary Contract (Module 23.2).
 *
 * Defines the public surface of the Analytics application service layer.
 * All controller interactions are restricted to this interface (DIP).
 * The concrete implementation is injected at startup via the DI container.
 */
export interface IAnalyticsService {
  /**
   * Executes an analytics query based on the fully validated request parameters
   * and returns a standardised IAnalyticsResponse envelope.
   *
   * @param request Validated and transformed analytics request parameters.
   * @returns Resolved analytics response with computed metrics and chart data.
   */
  getAnalytics(request: IAnalyticsRequest): Promise<IAnalyticsResponse>;

  /**
   * Returns dashboard-level KPI summary cards for the given date range.
   *
   * @param request Validated analytics request (metrics, dateRange, timezone).
   * @returns Response containing populated summary[] array.
   */
  getSummaryCards(request: IAnalyticsRequest): Promise<IAnalyticsResponse>;

  /**
   * Returns a time-series chart data series grouped by the specified granularity.
   *
   * @param request Validated analytics request (groupBy, dateRange, metrics).
   * @returns Response containing populated chartData[] array.
   */
  getChartData(request: IAnalyticsRequest): Promise<IAnalyticsResponse>;

  /**
   * Returns a ranked entity list (e.g. top-selling products, top categories)
   * with pagination.
   *
   * @param request Validated analytics request (metric, limit, sortOrder).
   * @returns Response containing populated rankings[] and pagination metadata.
   */
  getRankings(request: IAnalyticsRequest): Promise<IAnalyticsResponse>;
}
