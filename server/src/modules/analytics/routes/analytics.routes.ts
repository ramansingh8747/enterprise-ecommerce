import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import { authorize, ROLES } from '../../../middleware/role.middleware';
import { analyticsController } from '../../../container';
import {
  getAnalyticsValidation,
  getSummaryValidation,
  getChartValidation,
  getRankingsValidation,
} from '../validators/analytics.validator';

/**
 * Analytics & Reporting Engine — REST Routes (Module 23.5).
 *
 * Thin route-wiring layer. Contains no business logic and makes no
 * direct database or service calls.
 *
 * Middleware execution order for every route:
 *   1. authenticate          — Verifies Bearer JWT; populates req.user.
 *                              Returns 401 when token is absent or invalid.
 *   2. authorize(...)        — Enforces ADMIN / SUPER_ADMIN role via RBAC.
 *                              Returns 403 when role is insufficient.
 *   3. *Validation chain     — express-validator field chains validate all
 *                              accepted query parameters.
 *   4. validateRequest gate  — Short-circuits with 400 on the first failed rule.
 *                              Included as the last element of each validation array.
 *   5. Controller handler    — Thin adapter; delegates to IAnalyticsService.
 *
 * Analytics endpoints are restricted to ADMIN and SUPER_ADMIN roles because
 * they expose aggregated business intelligence data across all customers,
 * orders, products, and revenue figures.
 *
 * Mounted at: /api/v1/analytics  (registered in src/app.ts)
 */
const analyticsRouter = Router();

/* --------------------------------------------------------------------------
   GET /api/v1/analytics
   -------------------------------------------------------------------------- */

/**
 * General-purpose analytics query.
 *
 * Resolves summary cards, chart data, and/or rankings based on the
 * `reportType` and `metrics` query parameters. Accepts all 14 supported
 * query parameters.
 *
 * Query parameters (all optional):
 *   dateFrom      — ISO 8601 inclusive start date
 *   dateTo        — ISO 8601 inclusive end date
 *   period        — Pre-defined relative window (e.g. LAST_30_DAYS)
 *   metrics       — Comma-separated AnalyticsMetric values
 *   groupBy       — Time/dimension granularity (DAY, MONTH, CATEGORY, ...)
 *   timezone      — IANA timezone string (default: UTC)
 *   reportType    — Named report template (SALES_OVERVIEW, REVENUE_TREND, ...)
 *   categoryId    — MongoDB ObjectId filter
 *   brandId       — MongoDB ObjectId filter
 *   productId     — MongoDB ObjectId filter
 *   status        — Order / payment status filter
 *   page          — Page number for ranked results (default: 1)
 *   limit         — Page size for ranked results (default: 10, max: 100)
 *   sortBy        — Field name for ranked result ordering
 *   sortOrder     — ASC | DESC (default: DESC)
 */
analyticsRouter.get(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...getAnalyticsValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    analyticsController.getAnalytics(req, res, next);
  }
);

/* --------------------------------------------------------------------------
   GET /api/v1/analytics/summary
   -------------------------------------------------------------------------- */

/**
 * Dashboard KPI summary panel endpoint.
 *
 * Returns headline metric cards enriched with period-over-period growth
 * context (previousValue, changePercent, isTrendPositive).
 * Optimised for admin dashboard overview pages.
 *
 * Query parameters (all optional):
 *   dateFrom, dateTo, period, metrics, timezone,
 *   categoryId, brandId, productId, status
 */
analyticsRouter.get(
  '/summary',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...getSummaryValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    analyticsController.getSummary(req, res, next);
  }
);

/* --------------------------------------------------------------------------
   GET /api/v1/analytics/chart
   -------------------------------------------------------------------------- */

/**
 * Time-series or categorical chart data endpoint.
 *
 * Returns a data series grouped by the `groupBy` granularity.
 * Each data point includes the primary value, an optional comparison
 * period value, and a changePercent for trend rendering.
 *
 * Query parameters (all optional):
 *   dateFrom, dateTo, period, metrics, groupBy, timezone,
 *   categoryId, brandId, productId, status
 */
analyticsRouter.get(
  '/chart',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...getChartValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    analyticsController.getChart(req, res, next);
  }
);

/* --------------------------------------------------------------------------
   GET /api/v1/analytics/rankings
   -------------------------------------------------------------------------- */

/**
 * Ranked entity list endpoint (products, categories, brands).
 *
 * Returns a paginated ranked list ordered by the requested metric and
 * sort direction. Rank numbers account for the current page offset so
 * rank 1 on page 2 equals (limit + 1).
 *
 * Query parameters (all optional):
 *   dateFrom, dateTo, period, metrics, timezone,
 *   categoryId, brandId, productId, status,
 *   page, limit, sortBy, sortOrder
 */
analyticsRouter.get(
  '/rankings',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  ...getRankingsValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    analyticsController.getRankings(req, res, next);
  }
);

export default analyticsRouter;
