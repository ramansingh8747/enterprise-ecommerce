import { IAnalyticsRequest, IAnalyticsResponse, IChartDataPoint, ISummaryCard, IMetricResult } from './analytics.interface';
import { AnalyticsMetric } from '../types/analytics.types';

/**
 * Analytics Repository Data-Access Boundary Contract (Module 23.2).
 *
 * Defines all database query signatures for the analytics aggregation layer.
 * Implementations delegate to MongoDB aggregation pipelines.
 * The service layer depends on this interface (DIP), never on the concrete class.
 */
export interface IAnalyticsRepository {
  /**
   * Aggregates total revenue and order count within the given date range.
   *
   * @param request Validated analytics request containing date range and filters.
   * @returns Array of summary cards for revenue and order KPIs.
   */
  aggregateSalesMetrics(request: IAnalyticsRequest): Promise<ISummaryCard[]>;

  /**
   * Aggregates time-series revenue data points grouped by the requested granularity.
   *
   * @param request Validated analytics request with groupBy and date range.
   * @returns Ordered array of chart data points indexed by time label.
   */
  aggregateRevenueTrend(request: IAnalyticsRequest): Promise<IChartDataPoint[]>;

  /**
   * Ranks products by total units sold or total revenue within the date range.
   *
   * @param request Validated analytics request with limit, sortOrder, and filters.
   * @returns Ranked list of product metric results with pagination metadata.
   */
  aggregateTopProducts(request: IAnalyticsRequest): Promise<{ items: IMetricResult[]; total: number }>;

  /**
   * Aggregates customer acquisition and retention KPIs within the date range.
   *
   * @param request Validated analytics request containing date range and filters.
   * @returns Array of summary cards for customer KPIs.
   */
  aggregateCustomerMetrics(request: IAnalyticsRequest): Promise<ISummaryCard[]>;

  /**
   * Aggregates inventory health KPIs (low stock, out-of-stock counts).
   *
   * @param request Validated analytics request (filters: categoryId, brandId).
   * @returns Array of summary cards for inventory KPIs.
   */
  aggregateInventoryMetrics(request: IAnalyticsRequest): Promise<ISummaryCard[]>;

  /**
   * Aggregates category-level revenue and order breakdown within the date range.
   *
   * @param request Validated analytics request with groupBy = CATEGORY.
   * @returns Ordered array of chart data points indexed by category label.
   */
  aggregateCategoryBreakdown(request: IAnalyticsRequest): Promise<IChartDataPoint[]>;

  /**
   * Aggregates coupon usage statistics and discount impact within the date range.
   *
   * @param request Validated analytics request with coupon filters.
   * @returns Array of summary cards for coupon KPIs.
   */
  aggregateCouponMetrics(request: IAnalyticsRequest): Promise<ISummaryCard[]>;

  /**
   * Aggregates review volume and average rating KPIs within the date range.
   *
   * @param request Validated analytics request with optional productId filter.
   * @returns Array of summary cards for review and rating KPIs.
   */
  aggregateReviewMetrics(request: IAnalyticsRequest): Promise<ISummaryCard[]>;
}
