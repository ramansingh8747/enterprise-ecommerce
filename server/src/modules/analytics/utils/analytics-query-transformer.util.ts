import { IAnalyticsRequest, IDateRange } from '../interfaces/analytics.interface';
import { AnalyticsRequestDto } from '../dto/analytics-request.dto';
import {
  AnalyticsMetric,
  AnalyticsGroupBy,
  AnalyticsPeriod,
  AnalyticsSortOrder,
} from '../types/analytics.types';
import {
  ANALYTICS_DEFAULT_GROUP_BY,
  ANALYTICS_DEFAULT_LIMIT,
  ANALYTICS_DEFAULT_PAGE,
  ANALYTICS_DEFAULT_PERIOD,
  ANALYTICS_DEFAULT_SORT_ORDER,
  ANALYTICS_DEFAULT_TIMEZONE,
  ANALYTICS_MAX_LIMIT,
  ANALYTICS_VALID_GROUP_BY,
  ANALYTICS_VALID_PERIODS,
  ANALYTICS_VALID_SORT_ORDERS,
} from '../constants/analytics.constants';

/**
 * Analytics Query Transformer Utility (Module 23.6).
 *
 * Single-responsibility utility that converts a raw AnalyticsRequestDto
 * (HTTP query parameter strings) into a fully typed, sanitised, and
 * default-applied IAnalyticsRequest domain object consumed by the service layer.
 *
 * Transformations performed:
 *   1. Sanitise — trim all string values; strip ObjectId filter whitespace.
 *   2. Default  — apply module constants for missing optional fields.
 *   3. Resolve  — convert AnalyticsPeriod → absolute IDateRange.
 *   4. Parse    — parse page / limit strings to clamped integers.
 *   5. Normalise— uppercase enum values; remove duplicate metrics.
 *   6. Validate — apply defensive guards for ranges and set membership.
 *
 * Pure static class — no side effects, no database calls, no Express imports.
 * All default values come from analytics.constants.ts (zero magic numbers).
 */
export class AnalyticsQueryTransformer {

  /* ==========================================================================
     PUBLIC TRANSFORM ENTRY POINT
     ======================================================================== */

  /**
   * Transforms a raw AnalyticsRequestDto (HTTP query params) into the
   * typed IAnalyticsRequest consumed by the service layer.
   *
   * Transformation is idempotent — calling transform() on an already
   * transformed DTO produces an identical result.
   */
  static transform(dto: AnalyticsRequestDto): IAnalyticsRequest {
    const timezone  = AnalyticsQueryTransformer.sanitizeTimezone(dto.timezone);
    const groupBy   = AnalyticsQueryTransformer.sanitizeGroupBy(dto.groupBy);
    const period    = AnalyticsQueryTransformer.sanitizePeriod(dto.period);
    const sortOrder = AnalyticsQueryTransformer.sanitizeSortOrder(dto.sortOrder);
    const page      = AnalyticsQueryTransformer.sanitizePage(dto.page);
    const limit     = AnalyticsQueryTransformer.sanitizeLimit(dto.limit);
    const metrics   = AnalyticsQueryTransformer.sanitizeMetrics(dto.metrics);
    const dateRange = AnalyticsQueryTransformer.resolveDateRange(dto, timezone);

    return {
      dateRange,
      period,
      metrics,
      groupBy,
      timezone,
      reportType:  dto.reportType,
      filters:     [],
      page,
      limit,
      sortBy:      AnalyticsQueryTransformer.sanitizeString(dto.sortBy),
      sortOrder,
      categoryId:  AnalyticsQueryTransformer.sanitizeObjectId(dto.categoryId),
      brandId:     AnalyticsQueryTransformer.sanitizeObjectId(dto.brandId),
      productId:   AnalyticsQueryTransformer.sanitizeObjectId(dto.productId),
      status:      AnalyticsQueryTransformer.sanitizeString(dto.status),
    };
  }

  /* ==========================================================================
     PRIVATE SANITISATION HELPERS
     ======================================================================== */

  /**
   * Trims a string and returns undefined for absent or whitespace-only values.
   */
  private static sanitizeString(value: string | undefined): string | undefined {
    if (value === undefined || value === null) return undefined;
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  /**
   * Sanitises and validates a MongoDB ObjectId string.
   * Returns undefined for absent, empty, or structurally invalid strings.
   * The 24-char hex format check is a lightweight pre-filter only;
   * full ObjectId validity was already enforced by the validator chain.
   */
  private static sanitizeObjectId(value: string | undefined): string | undefined {
    const clean = AnalyticsQueryTransformer.sanitizeString(value);
    if (!clean) return undefined;
    return /^[0-9a-fA-F]{24}$/.test(clean) ? clean : undefined;
  }

  /**
   * Sanitises and normalises the IANA timezone string.
   * Falls back to ANALYTICS_DEFAULT_TIMEZONE when absent or empty.
   */
  private static sanitizeTimezone(value: string | undefined): string {
    const clean = AnalyticsQueryTransformer.sanitizeString(value);
    return clean ?? ANALYTICS_DEFAULT_TIMEZONE;
  }

  /**
   * Sanitises and validates the groupBy value.
   * Accepts the raw string from the DTO (already validated by the chain).
   * Falls back to ANALYTICS_DEFAULT_GROUP_BY when absent or invalid.
   */
  private static sanitizeGroupBy(value: AnalyticsGroupBy | undefined): AnalyticsGroupBy {
    if (!value) return ANALYTICS_DEFAULT_GROUP_BY;
    const upper = String(value).trim().toUpperCase();
    return ANALYTICS_VALID_GROUP_BY.includes(upper)
      ? (upper as AnalyticsGroupBy)
      : ANALYTICS_DEFAULT_GROUP_BY;
  }

  /**
   * Sanitises and validates the period value.
   * Falls back to ANALYTICS_DEFAULT_PERIOD when absent or unrecognised.
   */
  private static sanitizePeriod(value: AnalyticsPeriod | undefined): AnalyticsPeriod {
    if (!value) return ANALYTICS_DEFAULT_PERIOD;
    const upper = String(value).trim().toUpperCase();
    return ANALYTICS_VALID_PERIODS.includes(upper)
      ? (upper as AnalyticsPeriod)
      : ANALYTICS_DEFAULT_PERIOD;
  }

  /**
   * Sanitises and normalises the sortOrder value to uppercase.
   * Falls back to ANALYTICS_DEFAULT_SORT_ORDER when absent or invalid.
   */
  private static sanitizeSortOrder(value: AnalyticsSortOrder | undefined): AnalyticsSortOrder {
    if (!value) return ANALYTICS_DEFAULT_SORT_ORDER;
    const upper = String(value).trim().toUpperCase();
    return ANALYTICS_VALID_SORT_ORDERS.includes(upper)
      ? (upper as AnalyticsSortOrder)
      : ANALYTICS_DEFAULT_SORT_ORDER;
  }

  /**
   * Parses and clamps the page string to a valid 1-based integer.
   * Returns ANALYTICS_DEFAULT_PAGE for absent, non-numeric, or negative values.
   */
  private static sanitizePage(value: string | undefined): number {
    if (!value) return ANALYTICS_DEFAULT_PAGE;
    const parsed = parseInt(String(value).trim(), 10);
    if (isNaN(parsed) || parsed < 1) return ANALYTICS_DEFAULT_PAGE;
    return parsed;
  }

  /**
   * Parses and clamps the limit string to the valid [1, ANALYTICS_MAX_LIMIT] range.
   * Returns ANALYTICS_DEFAULT_LIMIT for absent or invalid values.
   */
  private static sanitizeLimit(value: string | undefined): number {
    if (!value) return ANALYTICS_DEFAULT_LIMIT;
    const parsed = parseInt(String(value).trim(), 10);
    if (isNaN(parsed) || parsed < 1) return ANALYTICS_DEFAULT_LIMIT;
    return Math.min(parsed, ANALYTICS_MAX_LIMIT);
  }

  /**
   * Parses a comma-separated metrics string into a deduplicated AnalyticsMetric[].
   *
   * Transformation steps:
   *   1. Split on commas.
   *   2. Trim each token.
   *   3. Filter empty tokens.
   *   4. Cast to AnalyticsMetric (validator already enforced membership).
   *   5. Remove duplicates preserving first-occurrence order.
   *
   * Returns an empty array when the metrics field is absent.
   */
  private static sanitizeMetrics(value: string | undefined): AnalyticsMetric[] {
    if (!value) return [];

    const tokens = String(value)
      .split(',')
      .map((m) => m.trim().toUpperCase())
      .filter(Boolean) as AnalyticsMetric[];

    // Deduplicate while preserving first-occurrence order
    const seen = new Set<AnalyticsMetric>();
    const deduped: AnalyticsMetric[] = [];
    for (const token of tokens) {
      if (!seen.has(token)) {
        seen.add(token);
        deduped.push(token);
      }
    }

    return deduped;
  }

  /* ==========================================================================
     DATE RANGE RESOLUTION
     ======================================================================== */

  /**
   * Resolves a concrete absolute IDateRange from the DTO.
   *
   * Resolution priority:
   *   1. Explicit dateFrom + dateTo (both present) → parse directly.
   *   2. Named AnalyticsPeriod → delegate to periodToDateRange().
   *   3. Default period (ANALYTICS_DEFAULT_PERIOD) → fallback.
   *
   * Ensures the resulting dates are valid Date objects (not NaN).
   */
  static resolveDateRange(dto: AnalyticsRequestDto, _timezone: string): IDateRange {
    const rawFrom = dto.dateFrom ? String(dto.dateFrom).trim() : undefined;
    const rawTo   = dto.dateTo   ? String(dto.dateTo).trim()   : undefined;

    if (rawFrom && rawTo) {
      const from = new Date(rawFrom);
      const to   = new Date(rawTo);

      if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
        // Normalise: start of day for from, end of day for to
        from.setUTCHours(0, 0, 0, 0);
        to.setUTCHours(23, 59, 59, 999);
        return { from, to };
      }
    }

    const period = AnalyticsQueryTransformer.sanitizePeriod(dto.period);
    return AnalyticsQueryTransformer.periodToDateRange(period, new Date());
  }

  /**
   * Converts a named AnalyticsPeriod to an absolute IDateRange relative to `now`.
   *
   * All boundaries are computed in UTC to ensure consistent aggregation
   * across client timezones. The timezone parameter is applied inside
   * MongoDB $dateToString expressions at the aggregation layer.
   */
  static periodToDateRange(period: AnalyticsPeriod, now: Date): IDateRange {
    const startOfDay = (d: Date): Date => {
      const clone = new Date(d);
      clone.setUTCHours(0, 0, 0, 0);
      return clone;
    };

    const endOfDay = (d: Date): Date => {
      const clone = new Date(d);
      clone.setUTCHours(23, 59, 59, 999);
      return clone;
    };

    const today    = startOfDay(now);
    const todayEnd = endOfDay(now);

    switch (period) {

      case AnalyticsPeriod.TODAY: {
        return { from: today, to: todayEnd };
      }

      case AnalyticsPeriod.YESTERDAY: {
        const yesterday = new Date(today);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
      }

      case AnalyticsPeriod.LAST_7_DAYS: {
        const from = new Date(today);
        from.setUTCDate(from.getUTCDate() - 6);
        return { from: startOfDay(from), to: todayEnd };
      }

      case AnalyticsPeriod.LAST_30_DAYS: {
        const from = new Date(today);
        from.setUTCDate(from.getUTCDate() - 29);
        return { from: startOfDay(from), to: todayEnd };
      }

      case AnalyticsPeriod.LAST_90_DAYS: {
        const from = new Date(today);
        from.setUTCDate(from.getUTCDate() - 89);
        return { from: startOfDay(from), to: todayEnd };
      }

      case AnalyticsPeriod.THIS_MONTH: {
        const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        return { from, to: todayEnd };
      }

      case AnalyticsPeriod.LAST_MONTH: {
        const firstOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const lastOfPrevMonth  = new Date(firstOfThisMonth.getTime() - 1);
        const firstOfPrevMonth = new Date(
          Date.UTC(lastOfPrevMonth.getUTCFullYear(), lastOfPrevMonth.getUTCMonth(), 1)
        );
        return { from: firstOfPrevMonth, to: endOfDay(lastOfPrevMonth) };
      }

      case AnalyticsPeriod.THIS_QUARTER: {
        const quarter = Math.floor(now.getUTCMonth() / 3);
        const from    = new Date(Date.UTC(now.getUTCFullYear(), quarter * 3, 1));
        return { from, to: todayEnd };
      }

      case AnalyticsPeriod.LAST_QUARTER: {
        const currentQuarter = Math.floor(now.getUTCMonth() / 3);
        const prevQStartMonth = currentQuarter === 0 ? 9 : (currentQuarter - 1) * 3;
        const prevQYear       = currentQuarter === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
        const from = new Date(Date.UTC(prevQYear, prevQStartMonth, 1));
        const to   = new Date(Date.UTC(prevQYear, prevQStartMonth + 3, 0, 23, 59, 59, 999));
        return { from, to };
      }

      case AnalyticsPeriod.THIS_YEAR: {
        const from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
        return { from, to: todayEnd };
      }

      case AnalyticsPeriod.LAST_YEAR: {
        const year = now.getUTCFullYear() - 1;
        return {
          from: new Date(Date.UTC(year, 0, 1)),
          to:   new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
        };
      }

      case AnalyticsPeriod.ALL_TIME: {
        return {
          from: new Date(0),  // Unix epoch — earliest possible record
          to:   todayEnd,
        };
      }

      // CUSTOM and unrecognised values fall back to LAST_30_DAYS.
      // CUSTOM is only valid when explicit dateFrom + dateTo are provided
      // (enforced by the cross-field validator); if somehow both are missing
      // the transformer defaults to LAST_30_DAYS to prevent empty results.
      case AnalyticsPeriod.CUSTOM:
      default: {
        const from = new Date(today);
        from.setUTCDate(from.getUTCDate() - 29);
        return { from: startOfDay(from), to: todayEnd };
      }
    }
  }
}
