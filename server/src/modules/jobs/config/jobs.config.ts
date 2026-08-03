import { JobPriority } from '../enums/jobs.enums';
import {
  DEFAULT_BATCH_SIZE,
  DEFAULT_JOB_TIMEOUT,
  DEFAULT_QUEUE_NAME,
  DEFAULT_RETENTION_DAYS,
  DEFAULT_RETRY_COUNT,
  MAX_CONCURRENT_JOBS,
} from '../constants/jobs.constants';

/**
 * Enterprise Background Jobs Engine Configuration (Module 25.1 / 25.6).
 *
 * Strongly-typed options governing queue workers, scheduling, concurrency limits,
 * execution timeouts, retry mechanisms, retention windows, and graceful shutdown thresholds.
 * Supports environment variable overrides with safe production fallbacks.
 */
export interface IJobConfig {
  /** Master switch enabling or disabling background job engine execution. */
  enabled: boolean;

  /** Master switch enabling or disabling automatic background job scheduling. */
  schedulerEnabled: boolean;

  /** Master switch enabling or disabling automatic retry execution for failed jobs. */
  retryEnabled: boolean;

  /** Maximum concurrent worker tasks executing simultaneously. */
  maxConcurrency: number;

  /** Default task queue name identifier. */
  queueName: string;

  /** Default execution timeout in milliseconds. */
  defaultTimeout: number;

  /** Default retry attempts for failed jobs. */
  defaultRetryCount: number;

  /** Default batch size for bulk creation operations. */
  batchSize: number;

  /** Retention window for finished job records in days. */
  retentionDays: number;

  /** Graceful shutdown timeout in milliseconds. */
  shutdownTimeoutMs: number;

  /** Whether healthcheck metrics endpoint is enabled. */
  healthcheckEnabled: boolean;

  /** Default priority level assigned to new jobs. */
  defaultPriority: JobPriority;
}

/**
 * Default production-ready background jobs engine configuration with environment fallbacks.
 */
export const DEFAULT_JOB_CONFIG: IJobConfig = {
  enabled: process.env.JOBS_ENABLED !== 'false',
  schedulerEnabled: process.env.JOB_SCHEDULER_ENABLED !== 'false',
  retryEnabled: process.env.JOB_RETRY_ENABLED !== 'false',
  maxConcurrency: process.env.JOBS_MAX_CONCURRENCY
    ? parseInt(process.env.JOBS_MAX_CONCURRENCY, 10)
    : MAX_CONCURRENT_JOBS,
  queueName: process.env.JOB_QUEUE_NAME || DEFAULT_QUEUE_NAME,
  defaultTimeout: process.env.JOBS_DEFAULT_TIMEOUT
    ? parseInt(process.env.JOBS_DEFAULT_TIMEOUT, 10)
    : DEFAULT_JOB_TIMEOUT,
  defaultRetryCount: process.env.JOBS_DEFAULT_RETRY_COUNT
    ? parseInt(process.env.JOBS_DEFAULT_RETRY_COUNT, 10)
    : DEFAULT_RETRY_COUNT,
  batchSize: process.env.JOBS_BATCH_SIZE
    ? parseInt(process.env.JOBS_BATCH_SIZE, 10)
    : DEFAULT_BATCH_SIZE,
  retentionDays: process.env.JOBS_RETENTION_DAYS
    ? parseInt(process.env.JOBS_RETENTION_DAYS, 10)
    : DEFAULT_RETENTION_DAYS,
  shutdownTimeoutMs: process.env.JOBS_SHUTDOWN_TIMEOUT
    ? parseInt(process.env.JOBS_SHUTDOWN_TIMEOUT, 10)
    : 10000,
  healthcheckEnabled: process.env.JOBS_HEALTHCHECK_ENABLED !== 'false',
  defaultPriority: JobPriority.NORMAL,
};
