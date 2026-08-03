import {
  AnalyticsMetric,
  AnalyticsGroupBy,
  AnalyticsPeriod,
  AnalyticsSortOrder,
  AnalyticsExportFormat,
  ReportType,
} from '../types/analytics.types';

/**
 * Analytics & Reporting Engine — Production Constants (Module 23.2).
 *
 * Single source of truth for limits, defaults, format strings, and
 * allowed value sets used across validators, services, and repositories.
 * All values are read-only to prevent accidental mutation at runtime.
 */

/* -------------------------------------------------------------------------- */
/*  Pagination defaults                                                         */
/* -------------------------------------------------------------------------- */

/** Default page size returned when `limit` is not specified. */
export const ANALYTICS_DEFAULT_LIMIT = 10 as const;

/** Maximum page size accepted; guards against unbounded aggregation. */
export const ANALYTICS_MAX_LIMIT = 100 as const;

/** Default page number when `page` is not specified. */
export const ANALYTICS_DEFAULT_PAGE = 1 as const;

/* -------------------------------------------------------------------------- */
/*  Date / Time                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Default IANA timezone applied when the client omits the `timezone` field.
 * All MongoDB $dateToString expressions use this as a fallback.
 */
export const ANALYTICS_DEFAULT_TIMEZONE = 'UTC' as const;

/**
 * ISO 8601 date string format accepted by dateFrom / dateTo query parameters.
 */
export const ANALYTICS_DATE_FORMAT = 'YYYY-MM-DD' as const;

/* -------------------------------------------------------------------------- */
/*  Allowed enum value arrays (for express-validator isIn() chains)            */
/* -------------------------------------------------------------------------- */

/** Flat array of all valid AnalyticsMetric string values. */
export const ANALYTICS_VALID_METRICS: string[] = Object.values(AnalyticsMetric);

/** Flat array of all valid AnalyticsGroupBy string values. */
export const ANALYTICS_VALID_GROUP_BY: string[] = Object.values(AnalyticsGroupBy);

/** Flat array of all valid ReportType string values. */
export const ANALYTICS_VALID_REPORT_TYPES: string[] = Object.values(ReportType);

/** Flat array of all valid AnalyticsPeriod string values. */
export const ANALYTICS_VALID_PERIODS: string[] = Object.values(AnalyticsPeriod);

/** Flat array of all valid AnalyticsSortOrder string values. */
export const ANALYTICS_VALID_SORT_ORDERS: string[] = Object.values(AnalyticsSortOrder);

/** Flat array of all valid export format string values. */
export const ANALYTICS_VALID_EXPORT_FORMATS: string[] = Object.values(AnalyticsExportFormat);

/* -------------------------------------------------------------------------- */
/*  Result-set limits                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Maximum number of products returned inside a TOP_SELLING_PRODUCTS metric.
 * Prevents unbounded in-memory sorting of product catalogues.
 */
export const ANALYTICS_TOP_PRODUCTS_LIMIT = 50 as const;

/**
 * Maximum number of categories or brands surfaced in a breakdown report.
 */
export const ANALYTICS_TOP_DIMENSIONS_LIMIT = 25 as const;

/* -------------------------------------------------------------------------- */
/*  Route segment constants                                                     */
/* -------------------------------------------------------------------------- */

/** Base path segment used by the analytics router (mounted at this prefix). */
export const ANALYTICS_BASE_PATH = '/api/v1/analytics' as const;

/* -------------------------------------------------------------------------- */
/*  Default values                                                              */
/* -------------------------------------------------------------------------- */

/** Default grouping granularity when `groupBy` is not provided. */
export const ANALYTICS_DEFAULT_GROUP_BY = AnalyticsGroupBy.DAY as const;

/** Default pre-defined period when neither `period` nor explicit dates are provided. */
export const ANALYTICS_DEFAULT_PERIOD = AnalyticsPeriod.LAST_30_DAYS as const;

/** Default sort order for ranked results. */
export const ANALYTICS_DEFAULT_SORT_ORDER = AnalyticsSortOrder.DESC as const;
