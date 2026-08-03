import { AnalyticsGroupBy, ReportType } from '../types/analytics.types';
import {
  IAnalyticsResponse,
  IChartDataPoint,
  ISummaryCard,
  IMetricResult,
  IDateRange,
} from '../interfaces/analytics.interface';

/**
 * Analytics Response DTO (Module 23.2).
 *
 * Concrete implementation class that satisfies IAnalyticsResponse
 * and is used as the data payload inside ApiResponse<AnalyticsResponseDto>.
 *
 * The controller wraps an instance of this class in:
 *   { success: true, message: '...', data: analyticsResponseDto }
 */
export class AnalyticsResponseDto implements IAnalyticsResponse {
  reportType: ReportType;
  dateRange: IDateRange;
  groupBy: AnalyticsGroupBy;
  summary?: ISummaryCard[];
  chartData?: IChartDataPoint[];
  rankings?: IMetricResult[];
  totalRankings?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  generatedAt: Date;
  executionTimeMs: number;
  timezone: string;

  constructor(partial: IAnalyticsResponse) {
    this.reportType      = partial.reportType;
    this.dateRange       = partial.dateRange;
    this.groupBy         = partial.groupBy;
    this.summary         = partial.summary;
    this.chartData       = partial.chartData;
    this.rankings        = partial.rankings;
    this.totalRankings   = partial.totalRankings;
    this.page            = partial.page;
    this.limit           = partial.limit;
    this.totalPages      = partial.totalPages;
    this.generatedAt     = partial.generatedAt;
    this.executionTimeMs = partial.executionTimeMs;
    this.timezone        = partial.timezone;
  }
}

/**
 * Paginated rankings wrapper returned by the /rankings endpoint.
 */
export interface PaginatedRankingsResponseDto {
  items: IMetricResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Lightweight dashboard overview response containing only summary cards
 * and the resolved date range. Used by the /summary endpoint.
 */
export interface SummaryResponseDto {
  summary: ISummaryCard[];
  dateRange: IDateRange;
  generatedAt: Date;
  executionTimeMs: number;
  timezone: string;
}

/**
 * Chart series response returned by the /chart endpoint.
 */
export interface ChartResponseDto {
  series: IChartDataPoint[];
  groupBy: AnalyticsGroupBy;
  dateRange: IDateRange;
  generatedAt: Date;
  executionTimeMs: number;
  timezone: string;
}
