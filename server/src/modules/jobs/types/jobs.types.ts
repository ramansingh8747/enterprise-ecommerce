import {
  JobPriority,
  JobStatus,
  JobTrigger,
  JobType,
} from '../enums/jobs.enums';

/**
 * Enterprise Background Jobs Engine — Shared Types (Module 25.1).
 *
 * Core domain types and payload shapes consumed across job providers, schedulers,
 * services, controllers, and workers.
 */

/**
 * Filtering options for querying background jobs.
 */
export type JobFilters = {
  type?: JobType | JobType[];
  status?: JobStatus | JobStatus[];
  priority?: JobPriority | JobPriority[];
  trigger?: JobTrigger | JobTrigger[];
  queueName?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  tags?: string[];
  correlationId?: string;
};

/**
 * Pagination and sorting options for querying job lists.
 */
export type JobPagination = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
};

/**
 * Execution override options when enqueuing or retrying jobs.
 */
export type JobExecutionOptions = {
  timeout?: number;
  retryCount?: number;
  priority?: JobPriority;
  delayMs?: number;
  queueName?: string;
  tags?: string[];
};

/**
 * Combined options for job search queries.
 */
export type JobSearchOptions = {
  filters?: JobFilters;
  pagination?: JobPagination;
};

/**
 * High-level summary metrics card for job execution overview.
 */
export type JobSummary = {
  totalJobs: number;
  completedCount: number;
  failedCount: number;
  pendingCount: number;
  runningCount: number;
  successRate: number;
};

/**
 * Detailed real-time job queue and worker metrics.
 */
export type JobMetrics = {
  totalExecuted: number;
  totalFailed: number;
  totalRetried: number;
  avgDurationMs: number;
  queueDepth: number;
  activeWorkers: number;
};

/**
 * Individual execution attempt history record.
 */
export type JobHistory = {
  executionId: string;
  status: JobStatus;
  durationMs?: number;
  errorMsg?: string;
  executedAt: Date;
};

/**
 * Schedule definition for recurring cron or interval jobs.
 */
export type JobSchedule = {
  cronExpression?: string;
  intervalMs?: number;
  timezone?: string;
  enabled: boolean;
  nextRunAt?: Date;
};

/**
 * Detailed statistical breakdown of background job executions.
 */
export type JobStatistics = {
  summary: JobSummary;
  metrics: JobMetrics;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byQueue: Record<string, number>;
};
