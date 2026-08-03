import { Meta, query } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';
import {
  ANALYTICS_VALID_METRICS,
  ANALYTICS_VALID_GROUP_BY,
  ANALYTICS_VALID_PERIODS,
  ANALYTICS_VALID_REPORT_TYPES,
  ANALYTICS_VALID_SORT_ORDERS,
  ANALYTICS_MAX_LIMIT,
} from '../constants/analytics.constants';
import { AnalyticsPeriod } from '../types/analytics.types';
import { OrderStatus, PaymentStatus } from '../../order/types/order.types';

/**
 * Analytics & Reporting Engine — Express-Validator Chains (Module 23.6).
 *
 * Validates and cross-validates all analytics query parameters before the
 * request reaches the controller.  Every exported array terminates with the
 * shared `validateRequest` gate that short-circuits with HTTP 400 on the
 * first failed rule, returning the project-standard error envelope.
 *
 * Cross-field rules implemented:
 *   1. dateFrom must not be after dateTo.
 *   2. CUSTOM period requires both dateFrom and dateTo.
 *   3. Comma-separated metrics are individually validated; duplicates rejected.
 *   4. status accepts any OrderStatus or PaymentStatus value.
 *   5. page / limit integer bounds are enforced (min 1, limit ≤ ANALYTICS_MAX_LIMIT).
 *   6. MongoId filters (categoryId, brandId, productId) reject invalid ObjectId strings.
 *   7. timezone length capped at 64 characters.
 *   8. sortBy is stripped of leading/trailing whitespace and must be non-empty.
 */

/* ============================================================================
   VALID STATUS SET
   Build once at module load — union of all Order and Payment status values.
   ========================================================================== */

const VALID_ORDER_STATUSES: string[]   = Object.values(OrderStatus);
const VALID_PAYMENT_STATUSES: string[] = Object.values(PaymentStatus);
const VALID_STATUS_VALUES: string[]    = [
  ...VALID_ORDER_STATUSES,
  ...VALID_PAYMENT_STATUSES,
];

/* ============================================================================
   INDIVIDUAL FIELD CHAINS
   Each chain is declared once and reused across the four validation arrays.
   ========================================================================== */

/**
 * dateFrom — optional ISO 8601 date string.
 * Cross-validated against dateTo inside the dateTo chain.
 */
const dateFromChain = query('dateFrom')
  .optional()
  .isISO8601()
  .withMessage('dateFrom must be a valid ISO 8601 date string (e.g. 2025-01-01).')
  .toDate();

/**
 * dateTo — optional ISO 8601 date string.
 * Cross-field rule: must be ≥ dateFrom when both are present.
 */
const dateToChain = query('dateTo')
  .optional()
  .isISO8601()
  .withMessage('dateTo must be a valid ISO 8601 date string (e.g. 2025-12-31).')
  .toDate()
  .custom((dateTo: Date, { req }: Meta) => {
    const dateFrom = req.query?.dateFrom;
    if (!dateFrom) return true;

    const fromDate = dateFrom instanceof Date ? dateFrom : new Date(String(dateFrom));
    if (isNaN(fromDate.getTime())) return true;

    if (dateTo < fromDate) {
      throw new Error('dateTo must be on or after dateFrom.');
    }
    return true;
  });

/**
 * period — optional predefined relative time window.
 * Cross-field rule: when period = CUSTOM, both dateFrom and dateTo are required.
 */
const periodChain = query('period')
  .optional()
  .isIn(ANALYTICS_VALID_PERIODS)
  .withMessage(`period must be one of: ${ANALYTICS_VALID_PERIODS.join(', ')}.`)
  .custom((period: string, { req }: Meta) => {
    if (period === AnalyticsPeriod.CUSTOM) {
      const { dateFrom, dateTo } = req.query ?? {};
      if (!dateFrom || !dateTo) {
        throw new Error(
          `period CUSTOM requires both dateFrom and dateTo to be provided.`
        );
      }
    }
    return true;
  });

/**
 * metrics — optional comma-separated AnalyticsMetric values.
 * Validates each member individually and rejects duplicates.
 */
const metricsChain = query('metrics')
  .optional()
  .isString()
  .withMessage('metrics must be a comma-separated string of AnalyticsMetric values.')
  .custom((value: string) => {
    const parts   = value.split(',').map((m) => m.trim()).filter(Boolean);

    if (parts.length === 0) {
      throw new Error('metrics must contain at least one value when provided.');
    }

    const invalid = parts.filter((m) => !ANALYTICS_VALID_METRICS.includes(m));
    if (invalid.length > 0) {
      throw new Error(
        `Invalid metric value(s): ${invalid.join(', ')}. ` +
        `Allowed: ${ANALYTICS_VALID_METRICS.join(', ')}.`
      );
    }

    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const m of parts) {
      if (seen.has(m)) {
        duplicates.push(m);
      }
      seen.add(m);
    }
    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate metric value(s) detected: ${duplicates.join(', ')}. ` +
        `Each metric must appear at most once.`
      );
    }

    return true;
  });

/**
 * groupBy — optional aggregation granularity.
 */
const groupByChain = query('groupBy')
  .optional()
  .isIn(ANALYTICS_VALID_GROUP_BY)
  .withMessage(`groupBy must be one of: ${ANALYTICS_VALID_GROUP_BY.join(', ')}.`);

/**
 * timezone — optional IANA timezone string.
 * Validates only format constraints (non-empty, ≤ 64 chars).
 * Full IANA validation would require a tzdata lookup which is kept in the service.
 */
const timezoneChain = query('timezone')
  .optional()
  .isString()
  .withMessage('timezone must be a string.')
  .trim()
  .notEmpty()
  .withMessage('timezone must not be an empty string when provided.')
  .isLength({ max: 64 })
  .withMessage('timezone must not exceed 64 characters.');

/**
 * reportType — optional named report template.
 */
const reportTypeChain = query('reportType')
  .optional()
  .isIn(ANALYTICS_VALID_REPORT_TYPES)
  .withMessage(`reportType must be one of: ${ANALYTICS_VALID_REPORT_TYPES.join(', ')}.`);

/**
 * categoryId — optional MongoDB ObjectId dimension filter.
 */
const categoryIdChain = query('categoryId')
  .optional()
  .isMongoId()
  .withMessage('categoryId must be a valid MongoDB ObjectId (24-character hex string).');

/**
 * brandId — optional MongoDB ObjectId dimension filter.
 */
const brandIdChain = query('brandId')
  .optional()
  .isMongoId()
  .withMessage('brandId must be a valid MongoDB ObjectId (24-character hex string).');

/**
 * productId — optional MongoDB ObjectId dimension filter.
 */
const productIdChain = query('productId')
  .optional()
  .isMongoId()
  .withMessage('productId must be a valid MongoDB ObjectId (24-character hex string).');

/**
 * status — optional order / payment lifecycle status filter.
 * Accepts any value from OrderStatus or PaymentStatus enums.
 */
const statusChain = query('status')
  .optional()
  .isString()
  .withMessage('status must be a string.')
  .trim()
  .notEmpty()
  .withMessage('status must not be an empty string when provided.')
  .isIn(VALID_STATUS_VALUES)
  .withMessage(
    `status must be a valid OrderStatus or PaymentStatus value. ` +
    `Allowed: ${VALID_STATUS_VALUES.join(', ')}.`
  );

/**
 * page — optional 1-based page number for paginated result sets.
 * Coerced to integer after validation.
 */
const pageChain = query('page')
  .optional()
  .isInt({ min: 1 })
  .withMessage('page must be a positive integer (minimum 1).')
  .toInt();

/**
 * limit — optional result-set page size.
 * Coerced to integer after validation.
 */
const limitChain = query('limit')
  .optional()
  .isInt({ min: 1, max: ANALYTICS_MAX_LIMIT })
  .withMessage(`limit must be an integer between 1 and ${ANALYTICS_MAX_LIMIT}.`)
  .toInt();

/**
 * sortBy — optional field name for ranked result ordering.
 * Must be a non-empty string after trimming.
 */
const sortByChain = query('sortBy')
  .optional()
  .isString()
  .withMessage('sortBy must be a string.')
  .trim()
  .notEmpty()
  .withMessage('sortBy must not be an empty string when provided.')
  .isLength({ max: 64 })
  .withMessage('sortBy must not exceed 64 characters.');

/**
 * sortOrder — optional ASC | DESC direction (case-insensitive accepted,
 * normalised to uppercase by the transformer).
 */
const sortOrderChain = query('sortOrder')
  .optional()
  .isIn(ANALYTICS_VALID_SORT_ORDERS)
  .withMessage(`sortOrder must be one of: ${ANALYTICS_VALID_SORT_ORDERS.join(', ')}.`);

/* ============================================================================
   EXPORTED VALIDATION ARRAYS
   Each array covers the parameters relevant to its endpoint and terminates
   with the validateRequest gate.
   ========================================================================== */

/**
 * Full validation chain for GET /api/v1/analytics
 * Validates all 14 supported query parameters + cross-field rules.
 */
export const getAnalyticsValidation = [
  dateFromChain,
  dateToChain,
  periodChain,
  metricsChain,
  groupByChain,
  timezoneChain,
  reportTypeChain,
  categoryIdChain,
  brandIdChain,
  productIdChain,
  statusChain,
  pageChain,
  limitChain,
  sortByChain,
  sortOrderChain,
  validateRequest,
];

/**
 * Validation chain for GET /api/v1/analytics/summary
 * Date range, period, metrics, timezone, and optional dimension filters.
 */
export const getSummaryValidation = [
  dateFromChain,
  dateToChain,
  periodChain,
  metricsChain,
  timezoneChain,
  categoryIdChain,
  brandIdChain,
  productIdChain,
  statusChain,
  validateRequest,
];

/**
 * Validation chain for GET /api/v1/analytics/chart
 * Adds groupBy requirement to the date/period + dimension filter set.
 */
export const getChartValidation = [
  dateFromChain,
  dateToChain,
  periodChain,
  metricsChain,
  groupByChain,
  timezoneChain,
  categoryIdChain,
  brandIdChain,
  productIdChain,
  statusChain,
  validateRequest,
];

/**
 * Validation chain for GET /api/v1/analytics/rankings
 * Adds pagination and sort parameters to the base filter set.
 */
export const getRankingsValidation = [
  dateFromChain,
  dateToChain,
  periodChain,
  metricsChain,
  timezoneChain,
  categoryIdChain,
  brandIdChain,
  productIdChain,
  statusChain,
  pageChain,
  limitChain,
  sortByChain,
  sortOrderChain,
  validateRequest,
];
