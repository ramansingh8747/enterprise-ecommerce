/**
 * Analytics & Reporting Engine — Shared Type Definitions (Module 23.2).
 *
 * Centralises all analytics-domain enums and type aliases consumed
 * across controllers, services, repositories, validators, and DTOs.
 * Transport-independent; contains no Mongoose or Express dependencies.
 */

/**
 * Enumeration of all measurable analytics metrics surfaced by the engine.
 * Each member maps directly to an aggregation pipeline projection field.
 */
export enum AnalyticsMetric {
  TOTAL_REVENUE        = 'TOTAL_REVENUE',
  TOTAL_ORDERS         = 'TOTAL_ORDERS',
  AVERAGE_ORDER_VALUE  = 'AVERAGE_ORDER_VALUE',
  TOTAL_CUSTOMERS      = 'TOTAL_CUSTOMERS',
  NEW_CUSTOMERS        = 'NEW_CUSTOMERS',
  RETURNING_CUSTOMERS  = 'RETURNING_CUSTOMERS',
  TOTAL_PRODUCTS       = 'TOTAL_PRODUCTS',
  TOP_SELLING_PRODUCTS = 'TOP_SELLING_PRODUCTS',
  LOW_STOCK_PRODUCTS   = 'LOW_STOCK_PRODUCTS',
  OUT_OF_STOCK_PRODUCTS= 'OUT_OF_STOCK_PRODUCTS',
  TOTAL_REVIEWS        = 'TOTAL_REVIEWS',
  AVERAGE_RATING       = 'AVERAGE_RATING',
  CONVERSION_RATE      = 'CONVERSION_RATE',
  CART_ABANDONMENT_RATE= 'CART_ABANDONMENT_RATE',
  COUPON_USAGE_RATE    = 'COUPON_USAGE_RATE',
  REFUND_RATE          = 'REFUND_RATE',
  GROSS_PROFIT         = 'GROSS_PROFIT',
  NET_REVENUE          = 'NET_REVENUE',
  UNITS_SOLD           = 'UNITS_SOLD',
  PAGE_VIEWS           = 'PAGE_VIEWS',
}

/**
 * Time-series aggregation granularity options.
 * Controls the $dateToString format applied inside MongoDB aggregation pipelines.
 */
export enum AnalyticsGroupBy {
  HOUR      = 'HOUR',
  DAY       = 'DAY',
  WEEK      = 'WEEK',
  MONTH     = 'MONTH',
  QUARTER   = 'QUARTER',
  YEAR      = 'YEAR',
  CATEGORY  = 'CATEGORY',
  BRAND     = 'BRAND',
  PRODUCT   = 'PRODUCT',
  STATUS    = 'STATUS',
  CHANNEL   = 'CHANNEL',
  REGION    = 'REGION',
}

/**
 * Named report templates that bundle a predefined set of metrics, filters,
 * groupings, and date ranges into a single request identifier.
 */
export enum ReportType {
  SALES_OVERVIEW        = 'SALES_OVERVIEW',
  REVENUE_TREND         = 'REVENUE_TREND',
  PRODUCT_PERFORMANCE   = 'PRODUCT_PERFORMANCE',
  CUSTOMER_INSIGHTS     = 'CUSTOMER_INSIGHTS',
  INVENTORY_SUMMARY     = 'INVENTORY_SUMMARY',
  COUPON_EFFECTIVENESS  = 'COUPON_EFFECTIVENESS',
  REVIEW_SENTIMENT      = 'REVIEW_SENTIMENT',
  ORDER_FUNNEL          = 'ORDER_FUNNEL',
  CATEGORY_BREAKDOWN    = 'CATEGORY_BREAKDOWN',
  BRAND_PERFORMANCE     = 'BRAND_PERFORMANCE',
  GEOGRAPHIC_REPORT     = 'GEOGRAPHIC_REPORT',
  CUSTOM                = 'CUSTOM',
}

/**
 * Pre-defined relative time windows that resolve to concrete date ranges
 * at query time. Used when explicit dateFrom / dateTo are omitted.
 */
export enum AnalyticsPeriod {
  TODAY           = 'TODAY',
  YESTERDAY       = 'YESTERDAY',
  LAST_7_DAYS     = 'LAST_7_DAYS',
  LAST_30_DAYS    = 'LAST_30_DAYS',
  LAST_90_DAYS    = 'LAST_90_DAYS',
  THIS_MONTH      = 'THIS_MONTH',
  LAST_MONTH      = 'LAST_MONTH',
  THIS_QUARTER    = 'THIS_QUARTER',
  LAST_QUARTER    = 'LAST_QUARTER',
  THIS_YEAR       = 'THIS_YEAR',
  LAST_YEAR       = 'LAST_YEAR',
  ALL_TIME        = 'ALL_TIME',
  CUSTOM          = 'CUSTOM',
}

/**
 * Sort direction for ranked analytics result sets.
 */
export enum AnalyticsSortOrder {
  ASC  = 'ASC',
  DESC = 'DESC',
}

/**
 * Output serialisation format for analytics export endpoints.
 */
export enum AnalyticsExportFormat {
  JSON = 'JSON',
  CSV  = 'CSV',
}
