import {
  AnalyticsMetric,
  AnalyticsGroupBy,
  AnalyticsPeriod,
  AnalyticsSortOrder,
  AnalyticsExportFormat,
  ReportType,
} from '../types/analytics.types';

/**
 * Analytics Request DTO (Module 23.2).
 *
 * Represents the raw client-facing query parameter shape received by the
 * Express controller before transformation into IAnalyticsRequest.
 * All fields are strings or string arrays because query parameters arrive
 * as strings from the HTTP layer.
 *
 * Validated by the analytics.validator express-validator chain.
 */
export interface AnalyticsRequestDto {
  /**
   * ISO 8601 date string — inclusive start boundary (e.g. "2025-01-01").
   * Required when `period` is not provided.
   */
  dateFrom?: string;

  /**
   * ISO 8601 date string — inclusive end boundary (e.g. "2025-12-31").
   * Required when `period` is not provided.
   */
  dateTo?: string;

  /**
   * Pre-defined relative time window that resolves to a concrete date range.
   * Takes precedence over explicit dateFrom / dateTo when provided.
   */
  period?: AnalyticsPeriod;

  /**
   * Comma-separated list of AnalyticsMetric values to compute.
   * When omitted the service resolves the default metric set for the reportType.
   */
  metrics?: string;

  /**
   * Time-series or dimensional grouping granularity.
   * Defaults to AnalyticsGroupBy.DAY when omitted.
   */
  groupBy?: AnalyticsGroupBy;

  /**
   * IANA timezone string for date bucketing (e.g. "Asia/Kolkata").
   * Defaults to "UTC" when omitted.
   */
  timezone?: string;

  /**
   * Named report template identifier. Determines the default set of metrics
   * and filters when not specified individually.
   */
  reportType?: ReportType;

  /**
   * MongoDB ObjectId string of the category dimension filter.
   */
  categoryId?: string;

  /**
   * MongoDB ObjectId string of the brand dimension filter.
   */
  brandId?: string;

  /**
   * MongoDB ObjectId string of the product dimension filter.
   */
  productId?: string;

  /**
   * Order status filter (e.g. "DELIVERED", "CANCELLED").
   */
  status?: string;

  /**
   * Page number for paginated rankings result sets (1-based).
   * Defaults to 1 when omitted.
   */
  page?: string;

  /**
   * Maximum rows per page for paginated rankings.
   * Defaults to ANALYTICS_DEFAULT_LIMIT; capped at ANALYTICS_MAX_LIMIT.
   */
  limit?: string;

  /**
   * Field name to sort ranked results by.
   */
  sortBy?: string;

  /**
   * Sort direction for ranked results.
   * Defaults to AnalyticsSortOrder.DESC when omitted.
   */
  sortOrder?: AnalyticsSortOrder;
}
