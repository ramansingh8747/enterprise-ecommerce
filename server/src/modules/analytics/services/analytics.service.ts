import { IAnalyticsService } from '../interfaces/analytics-service.interface';
import { IAnalyticsRepository } from '../interfaces/analytics-repository.interface';
import {
  IAnalyticsRequest,
  IAnalyticsResponse,
  ISummaryCard,
  IChartDataPoint,
  IMetricResult,
  IDateRange,
} from '../interfaces/analytics.interface';
import { AnalyticsResponseDto } from '../dto/analytics-response.dto';
import {
  AnalyticsMetric,
  AnalyticsGroupBy,
  ReportType,
} from '../types/analytics.types';
import {
  ANALYTICS_DEFAULT_GROUP_BY,
  ANALYTICS_DEFAULT_TIMEZONE,
} from '../constants/analytics.constants';

/**
 * Analytics Service Implementation (Module 23.4).
 *
 * Application-layer orchestrator between the controller and the repository.
 * Implements IAnalyticsService (Dependency Inversion Principle).
 *
 * Responsibilities:
 * — Resolve the correct set of repository calls per ReportType.
 * — Derive growth percentages, trend flags, and change indicators.
 * — Merge, sort, and normalise raw repository results into IAnalyticsResponse.
 * — Guard all arithmetic against divide-by-zero and null/undefined values.
 * — Handle empty datasets gracefully (return zero-value cards, not exceptions).
 * — Record wall-clock execution time for observability.
 *
 * Rules enforced:
 * — No MongoDB imports. No mongoose types.
 * — No HTTP-specific code (no Request / Response / NextFunction).
 * — No hardcoded values — all defaults come from analytics.constants.ts.
 */
export class AnalyticsService implements IAnalyticsService {
  constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

  /* ========================================================================
     PRIVATE COMPUTATION HELPERS
     ====================================================================== */

  /**
   * Safe percentage change: ((current - previous) / previous) * 100.
   * Returns 0 when previous is zero or undefined to prevent divide-by-zero.
   */
  private pctChange(current: number, previous: number): number {
    if (!previous || previous === 0) return 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(2));
  }

  /**
   * Rounds a number to two decimal places.
   * Guards against NaN / Infinity from upstream aggregation.
   */
  private round2(value: number): number {
    if (!isFinite(value) || isNaN(value)) return 0;
    return parseFloat(value.toFixed(2));
  }

  /**
   * Resolves a "comparison period" request from the primary request so that
   * the service can compute period-over-period growth (e.g. this month vs.
   * last month). The comparison window has the same duration as the primary
   * window, immediately preceding it.
   */
  private buildComparisonRequest(request: IAnalyticsRequest): IAnalyticsRequest {
    const { from, to } = request.dateRange;
    const durationMs   = to.getTime() - from.getTime();

    const compareTo   = new Date(from.getTime() - 1);          // 1 ms before primary start
    const compareFrom = new Date(compareTo.getTime() - durationMs);

    const compareDateRange: IDateRange = { from: compareFrom, to: compareTo };

    return {
      ...request,
      dateRange: compareDateRange,
    };
  }

  /**
   * Finds the numeric value of a specific metric inside a summary card array.
   * Returns 0 if the metric is not present.
   */
  private findMetricValue(cards: ISummaryCard[], metric: AnalyticsMetric): number {
    return cards.find((c) => c.metric === metric)?.value ?? 0;
  }

  /**
   * Enriches a summary card with growth context by attaching
   * previousValue, changePercent, and isTrendPositive.
   * Returns a new card — does not mutate in place.
   */
  private enrichWithGrowth(
    card: ISummaryCard,
    previousCards: ISummaryCard[],
    positiveDirection: 'up' | 'down' = 'up'
  ): ISummaryCard {
    const previousValue = this.findMetricValue(previousCards, card.metric);
    const changePercent = this.pctChange(card.value, previousValue);
    const isTrendPositive =
      positiveDirection === 'up' ? changePercent >= 0 : changePercent <= 0;

    return {
      ...card,
      previousValue,
      changePercent,
      isTrendPositive,
    };
  }

  /**
   * Enriches chart data points with period-over-period comparison values
   * and change percentages by aligning labels across two series.
   */
  private enrichChartWithComparison(
    current: IChartDataPoint[],
    comparison: IChartDataPoint[]
  ): IChartDataPoint[] {
    const compMap = new Map<string, number>(comparison.map((p) => [p.label, p.value]));

    return current.map((point) => {
      const compareValue  = compMap.get(point.label) ?? 0;
      const changePercent = this.pctChange(point.value, compareValue);
      return {
        ...point,
        compareValue,
        changePercent,
      };
    });
  }

  /**
   * Derives an AOV summary card from an existing sales cards array.
   * AOV = TOTAL_REVENUE / TOTAL_ORDERS (safe against 0 orders).
   */
  private deriveAovCard(salesCards: ISummaryCard[]): ISummaryCard {
    const revenue = this.findMetricValue(salesCards, AnalyticsMetric.TOTAL_REVENUE);
    const orders  = this.findMetricValue(salesCards, AnalyticsMetric.TOTAL_ORDERS);
    const aov     = orders > 0 ? this.round2(revenue / orders) : 0;

    return {
      metric:    AnalyticsMetric.AVERAGE_ORDER_VALUE,
      label:     'Average Order Value',
      value:     aov,
      formatted: aov.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    };
  }

  /* ========================================================================
     PUBLIC SERVICE METHODS
     ====================================================================== */

  /**
   * GET /api/v1/analytics
   *
   * General-purpose analytics query. Resolves data for the requested
   * ReportType by orchestrating the appropriate repository calls and
   * computing all derived KPIs.
   *
   * ReportType dispatch table:
   *   SALES_OVERVIEW       → sales + customer + inventory metrics + revenue trend
   *   REVENUE_TREND        → revenue trend chart only
   *   PRODUCT_PERFORMANCE  → top products rankings + sales metrics
   *   CUSTOMER_INSIGHTS    → customer metrics + order metrics
   *   INVENTORY_SUMMARY    → inventory + category breakdown
   *   COUPON_EFFECTIVENESS → coupon metrics
   *   REVIEW_SENTIMENT     → review metrics
   *   CATEGORY_BREAKDOWN   → category breakdown chart
   *   CUSTOM / default     → sales + revenue trend + top products
   */
  async getAnalytics(request: IAnalyticsRequest): Promise<IAnalyticsResponse> {
    const startTime    = Date.now();
    const reportType   = request.reportType ?? ReportType.CUSTOM;
    const compareReq   = this.buildComparisonRequest(request);

    let summary:   ISummaryCard[]   = [];
    let chartData: IChartDataPoint[] = [];
    let rankings:  IMetricResult[]  = [];
    let total     = 0;

    switch (reportType) {
      case ReportType.SALES_OVERVIEW: {
        const [salesCurrent, salesPrev, customerCurrent, inventoryCurrent, trendCurrent] =
          await Promise.all([
            this.analyticsRepository.aggregateSalesMetrics(request),
            this.analyticsRepository.aggregateSalesMetrics(compareReq),
            this.analyticsRepository.aggregateCustomerMetrics(request),
            this.analyticsRepository.aggregateInventoryMetrics(request),
            this.analyticsRepository.aggregateRevenueTrend(request),
          ]);

        const aovCard = this.deriveAovCard(salesCurrent);
        summary = [
          ...salesCurrent.map((c) => this.enrichWithGrowth(c, salesPrev,
            c.metric === AnalyticsMetric.REFUND_RATE ? 'down' : 'up'
          )),
          aovCard,
          ...customerCurrent,
          ...inventoryCurrent,
        ];
        chartData = trendCurrent;
        break;
      }

      case ReportType.REVENUE_TREND: {
        const [trendCurrent, trendCompare] = await Promise.all([
          this.analyticsRepository.aggregateRevenueTrend(request),
          this.analyticsRepository.aggregateRevenueTrend(compareReq),
        ]);
        chartData = this.enrichChartWithComparison(trendCurrent, trendCompare);
        break;
      }

      case ReportType.PRODUCT_PERFORMANCE: {
        const [salesCurrent, salesPrev, productRankings] = await Promise.all([
          this.analyticsRepository.aggregateSalesMetrics(request),
          this.analyticsRepository.aggregateSalesMetrics(compareReq),
          this.analyticsRepository.aggregateTopProducts(request),
        ]);

        summary  = salesCurrent.map((c) => this.enrichWithGrowth(c, salesPrev));
        rankings = productRankings.items;
        total    = productRankings.total;
        break;
      }

      case ReportType.CUSTOMER_INSIGHTS: {
        const [customerCurrent, customerPrev, salesCurrent, salesPrev] = await Promise.all([
          this.analyticsRepository.aggregateCustomerMetrics(request),
          this.analyticsRepository.aggregateCustomerMetrics(compareReq),
          this.analyticsRepository.aggregateSalesMetrics(request),
          this.analyticsRepository.aggregateSalesMetrics(compareReq),
        ]);

        summary = [
          ...customerCurrent.map((c) => this.enrichWithGrowth(c, customerPrev)),
          ...salesCurrent
            .filter((c) =>
              c.metric === AnalyticsMetric.TOTAL_ORDERS ||
              c.metric === AnalyticsMetric.TOTAL_REVENUE
            )
            .map((c) => this.enrichWithGrowth(c, salesPrev)),
        ];
        break;
      }

      case ReportType.INVENTORY_SUMMARY: {
        const [inventoryCurrent, categoryBreakdown] = await Promise.all([
          this.analyticsRepository.aggregateInventoryMetrics(request),
          this.analyticsRepository.aggregateCategoryBreakdown(request),
        ]);

        summary   = inventoryCurrent;
        chartData = categoryBreakdown;
        break;
      }

      case ReportType.COUPON_EFFECTIVENESS: {
        const [couponCurrent, couponPrev] = await Promise.all([
          this.analyticsRepository.aggregateCouponMetrics(request),
          this.analyticsRepository.aggregateCouponMetrics(compareReq),
        ]);

        summary = couponCurrent.map((c) => this.enrichWithGrowth(c, couponPrev,
          c.metric === AnalyticsMetric.GROSS_PROFIT ? 'down' : 'up'
        ));
        break;
      }

      case ReportType.REVIEW_SENTIMENT: {
        const [reviewCurrent, reviewPrev] = await Promise.all([
          this.analyticsRepository.aggregateReviewMetrics(request),
          this.analyticsRepository.aggregateReviewMetrics(compareReq),
        ]);

        summary = reviewCurrent.map((c) => this.enrichWithGrowth(c, reviewPrev));
        break;
      }

      case ReportType.CATEGORY_BREAKDOWN: {
        const [catCurrent, catCompare] = await Promise.all([
          this.analyticsRepository.aggregateCategoryBreakdown(request),
          this.analyticsRepository.aggregateCategoryBreakdown(compareReq),
        ]);

        chartData = this.enrichChartWithComparison(catCurrent, catCompare);
        break;
      }

      case ReportType.BRAND_PERFORMANCE:
      case ReportType.ORDER_FUNNEL:
      case ReportType.GEOGRAPHIC_REPORT:
      case ReportType.CUSTOM:
      default: {
        const [salesCurrent, salesPrev, trendCurrent, productRankings] = await Promise.all([
          this.analyticsRepository.aggregateSalesMetrics(request),
          this.analyticsRepository.aggregateSalesMetrics(compareReq),
          this.analyticsRepository.aggregateRevenueTrend(request),
          this.analyticsRepository.aggregateTopProducts(request),
        ]);

        const aovCard = this.deriveAovCard(salesCurrent);
        summary   = [
          ...salesCurrent.map((c) => this.enrichWithGrowth(c, salesPrev,
            c.metric === AnalyticsMetric.REFUND_RATE ? 'down' : 'up'
          )),
          aovCard,
        ];
        chartData = trendCurrent;
        rankings  = productRankings.items;
        total     = productRankings.total;
        break;
      }
    }

    const limit      = request.limit;
    const page       = request.page;
    const totalPages = total > 0 && limit > 0 ? Math.ceil(total / limit) : 0;

    return new AnalyticsResponseDto({
      reportType,
      dateRange:       request.dateRange,
      groupBy:         request.groupBy   ?? ANALYTICS_DEFAULT_GROUP_BY,
      timezone:        request.timezone  ?? ANALYTICS_DEFAULT_TIMEZONE,
      summary:         summary.length   > 0 ? summary   : undefined,
      chartData:       chartData.length > 0 ? chartData : undefined,
      rankings:        rankings.length  > 0 ? rankings  : undefined,
      totalRankings:   total > 0 ? total : undefined,
      page:            rankings.length > 0 ? page       : undefined,
      limit:           rankings.length > 0 ? limit      : undefined,
      totalPages:      rankings.length > 0 ? totalPages : undefined,
      generatedAt:     new Date(),
      executionTimeMs: Date.now() - startTime,
    });
  }

  /**
   * GET /api/v1/analytics/summary
   *
   * Returns KPI summary cards for the dashboard overview panel.
   * Always fetches sales + customer + inventory metrics in parallel
   * and decorates each card with growth context vs. the prior period.
   */
  async getSummaryCards(request: IAnalyticsRequest): Promise<IAnalyticsResponse> {
    const startTime  = Date.now();
    const compareReq = this.buildComparisonRequest(request);

    const [
      salesCurrent,
      salesPrev,
      customerCurrent,
      customerPrev,
      inventoryCurrent,
      reviewCurrent,
    ] = await Promise.all([
      this.analyticsRepository.aggregateSalesMetrics(request),
      this.analyticsRepository.aggregateSalesMetrics(compareReq),
      this.analyticsRepository.aggregateCustomerMetrics(request),
      this.analyticsRepository.aggregateCustomerMetrics(compareReq),
      this.analyticsRepository.aggregateInventoryMetrics(request),
      this.analyticsRepository.aggregateReviewMetrics(request),
    ]);

    const aovCard = this.deriveAovCard(salesCurrent);

    const summary: ISummaryCard[] = [
      // Sales KPIs with growth
      ...salesCurrent.map((c) =>
        this.enrichWithGrowth(c, salesPrev,
          c.metric === AnalyticsMetric.REFUND_RATE ? 'down' : 'up'
        )
      ),
      // Derived AOV card
      aovCard,
      // Customer KPIs with growth
      ...customerCurrent.map((c) => this.enrichWithGrowth(c, customerPrev)),
      // Inventory KPIs (no comparison — point-in-time snapshot)
      ...inventoryCurrent,
      // Review KPIs (no previous comparison — review count grows monotonically)
      ...reviewCurrent,
    ];

    return new AnalyticsResponseDto({
      reportType:      request.reportType ?? ReportType.SALES_OVERVIEW,
      dateRange:       request.dateRange,
      groupBy:         request.groupBy  ?? ANALYTICS_DEFAULT_GROUP_BY,
      timezone:        request.timezone ?? ANALYTICS_DEFAULT_TIMEZONE,
      summary,
      generatedAt:     new Date(),
      executionTimeMs: Date.now() - startTime,
    });
  }

  /**
   * GET /api/v1/analytics/chart
   *
   * Returns a time-series or categorical chart data series.
   *
   * groupBy dispatch:
   *   CATEGORY → category revenue breakdown
   *   any other time granularity → revenue trend series
   *
   * Each data point is enriched with comparison period values and
   * change percentages for sparkline / comparison chart rendering.
   */
  async getChartData(request: IAnalyticsRequest): Promise<IAnalyticsResponse> {
    const startTime  = Date.now();
    const compareReq = this.buildComparisonRequest(request);

    let currentSeries:    IChartDataPoint[];
    let comparisonSeries: IChartDataPoint[];

    if (request.groupBy === AnalyticsGroupBy.CATEGORY) {
      [currentSeries, comparisonSeries] = await Promise.all([
        this.analyticsRepository.aggregateCategoryBreakdown(request),
        this.analyticsRepository.aggregateCategoryBreakdown(compareReq),
      ]);
    } else {
      [currentSeries, comparisonSeries] = await Promise.all([
        this.analyticsRepository.aggregateRevenueTrend(request),
        this.analyticsRepository.aggregateRevenueTrend(compareReq),
      ]);
    }

    const chartData = this.enrichChartWithComparison(currentSeries, comparisonSeries);

    return new AnalyticsResponseDto({
      reportType:      request.reportType ?? ReportType.REVENUE_TREND,
      dateRange:       request.dateRange,
      groupBy:         request.groupBy  ?? ANALYTICS_DEFAULT_GROUP_BY,
      timezone:        request.timezone ?? ANALYTICS_DEFAULT_TIMEZONE,
      chartData:       chartData.length > 0 ? chartData : undefined,
      generatedAt:     new Date(),
      executionTimeMs: Date.now() - startTime,
    });
  }

  /**
   * GET /api/v1/analytics/rankings
   *
   * Returns a ranked, paginated entity list.
   *
   * metric dispatch:
   *   Any product-level metric → top products by units/revenue
   *   default → top products by units sold
   *
   * Rankings are decorated with sequential rank numbers that account for
   * the current page offset so rank 1 on page 2 = rank (limit + 1).
   */
  async getRankings(request: IAnalyticsRequest): Promise<IAnalyticsResponse> {
    const startTime = Date.now();

    const { items, total } = await this.analyticsRepository.aggregateTopProducts(request);

    const limit      = request.limit;
    const page       = request.page;
    const totalPages = total > 0 && limit > 0 ? Math.ceil(total / limit) : 0;

    // Rank numbers are already set by the repository (1-based with page offset).
    // Enrich any missing metric values with safe zeros.
    const rankings: IMetricResult[] = items.map((item) => ({
      ...item,
      metrics: {
        [AnalyticsMetric.UNITS_SOLD]:    item.metrics[AnalyticsMetric.UNITS_SOLD]    ?? 0,
        [AnalyticsMetric.TOTAL_REVENUE]: item.metrics[AnalyticsMetric.TOTAL_REVENUE] ?? 0,
        [AnalyticsMetric.TOTAL_ORDERS]:  item.metrics[AnalyticsMetric.TOTAL_ORDERS]  ?? 0,
      },
    }));

    return new AnalyticsResponseDto({
      reportType:      request.reportType ?? ReportType.PRODUCT_PERFORMANCE,
      dateRange:       request.dateRange,
      groupBy:         request.groupBy  ?? ANALYTICS_DEFAULT_GROUP_BY,
      timezone:        request.timezone ?? ANALYTICS_DEFAULT_TIMEZONE,
      rankings:        rankings.length > 0 ? rankings  : undefined,
      totalRankings:   total > 0 ? total : undefined,
      page:            rankings.length > 0 ? page       : undefined,
      limit:           rankings.length > 0 ? limit      : undefined,
      totalPages:      rankings.length > 0 ? totalPages : undefined,
      generatedAt:     new Date(),
      executionTimeMs: Date.now() - startTime,
    });
  }
}
