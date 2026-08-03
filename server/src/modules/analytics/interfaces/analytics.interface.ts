import {
  AnalyticsMetric,
  AnalyticsGroupBy,
  AnalyticsPeriod,
  AnalyticsSortOrder,
  AnalyticsExportFormat,
  ReportType,
} from '../types/analytics.types';

/**
 * Analytics & Reporting Engine — Domain Interfaces (Module 23.2).
 *
 * Pure TypeScript contracts with no runtime dependencies.
 * Designed for maximum extensibility across future report types
 * without requiring interface modification (Open/Closed Principle).
 */

/* -------------------------------------------------------------------------- */
/*  Primitive building blocks                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Absolute UTC date boundary pair.
 * Both properties are ISO 8601 string representations accepted from client
 * requests and resolved to JavaScript Date objects inside the service layer.
 */
export interface IDateRange {
  /** Inclusive start timestamp (ISO 8601 — e.g. "2025-01-01T00:00:00.000Z"). */
  from: Date;
  /** Inclusive end timestamp (ISO 8601 — e.g. "2025-12-31T23:59:59.999Z"). */
  to: Date;
}

/**
 * Named key-value filter pair applied to an analytics aggregation pipeline.
 * Enables composable, runtime-constructed filter sets without type widening.
 */
export interface IAnalyticsFilter {
  /** MongoDB document field path to filter on (e.g. "status", "category"). */
  field: string;
  /** Scalar value or array of values to match against the field. */
  value: string | string[] | number | boolean;
}

/**
 * Single data point in a time-series or categorical chart response.
 */
export interface IChartDataPoint {
  /** Human-readable label for the x-axis (date string, category name, etc.). */
  label: string;
  /** Primary numeric value for this data point. */
  value: number;
  /** Optional secondary value (e.g. comparison period, prior year). */
  compareValue?: number;
  /** Optional percentage change relative to compareValue. */
  changePercent?: number;
  /** Optional arbitrary extra data attached to this point (e.g. top product name). */
  metadata?: Record<string, unknown>;
}

/**
 * KPI summary card — a single headline metric with optional trend context.
 * Used to render dashboard summary cards on the front-end.
 */
export interface ISummaryCard {
  /** Internal metric identifier. */
  metric: AnalyticsMetric;
  /** Human-readable display label (e.g. "Total Revenue"). */
  label: string;
  /** Computed numeric value for the requested date range. */
  value: number;
  /** Formatted string representation (e.g. "₹1,24,500.00"). */
  formatted: string;
  /** Optional value from the preceding equivalent period for trend display. */
  previousValue?: number;
  /** Optional percentage change vs. previous period (positive = growth). */
  changePercent?: number;
  /** Indicates whether the trend direction is positive for this metric. */
  isTrendPositive?: boolean;
}

/**
 * A single row in a ranked / tabular analytics result (e.g. top products).
 */
export interface IMetricResult {
  /** Rank position in the ordered result set (1-based). */
  rank: number;
  /** Primary entity identifier (product ID, category ID, etc.). */
  entityId: string;
  /** Human-readable entity label (product name, category name, etc.). */
  entityName: string;
  /** Optional secondary label (e.g. SKU, brand name). */
  entitySubLabel?: string;
  /** Map of metric keys to their computed values for this entity. */
  metrics: Partial<Record<AnalyticsMetric, number>>;
}

/* -------------------------------------------------------------------------- */
/*  Request contract                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Fully hydrated analytics query parameters after validation and transformation.
 * The controller parses raw query strings into this typed structure before
 * handing off to IAnalyticsService.
 */
export interface IAnalyticsRequest {
  /** Resolved absolute date range for the query. */
  dateRange: IDateRange;
  /** Named pre-defined period (used when dateFrom / dateTo are omitted). */
  period?: AnalyticsPeriod;
  /** List of metrics to compute in this request. */
  metrics: AnalyticsMetric[];
  /** Time-series or dimensional grouping granularity. */
  groupBy: AnalyticsGroupBy;
  /** IANA timezone string for date bucketing (default "UTC"). */
  timezone: string;
  /** Optional report type that pre-selects a metric/filter bundle. */
  reportType?: ReportType;
  /** Optional dimension filters applied to the aggregation pipeline. */
  filters?: IAnalyticsFilter[];
  /** Page number for paginated result sets (1-based). */
  page: number;
  /** Maximum records per page. */
  limit: number;
  /** Field to sort ranked results by. */
  sortBy?: string;
  /** Sort direction for ranked results. */
  sortOrder: AnalyticsSortOrder;
  /** Optional category dimension filter. */
  categoryId?: string;
  /** Optional brand dimension filter. */
  brandId?: string;
  /** Optional product dimension filter. */
  productId?: string;
  /** Optional order status filter. */
  status?: string;
  /** Requested output format (internal — not a client-visible query param). */
  exportFormat?: AnalyticsExportFormat;
}

/* -------------------------------------------------------------------------- */
/*  Response contract                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Standardised analytics query result envelope returned by IAnalyticsService.
 * All response properties are optional at the interface level;
 * concrete service implementations populate the fields relevant to the
 * requested report type.
 */
export interface IAnalyticsResponse {
  /** Report type or metric set identifier for this result. */
  reportType: ReportType;
  /** Resolved absolute date range used by the aggregation pipeline. */
  dateRange: IDateRange;
  /** Requested grouping granularity echoed back for client rendering. */
  groupBy: AnalyticsGroupBy;
  /** KPI summary cards (one per requested metric). */
  summary?: ISummaryCard[];
  /** Time-series or categorical chart data series. */
  chartData?: IChartDataPoint[];
  /** Ranked tabular result rows (e.g. top products, top categories). */
  rankings?: IMetricResult[];
  /** Total number of ranking rows available (before pagination). */
  totalRankings?: number;
  /** Current page number for paginated rankings. */
  page?: number;
  /** Page size for paginated rankings. */
  limit?: number;
  /** Total pages available for paginated rankings. */
  totalPages?: number;
  /** UTC timestamp (ISO 8601) at which the aggregation was executed. */
  generatedAt: Date;
  /** Wall-clock query execution time in milliseconds. */
  executionTimeMs: number;
  /** IANA timezone applied during aggregation. */
  timezone: string;
}
