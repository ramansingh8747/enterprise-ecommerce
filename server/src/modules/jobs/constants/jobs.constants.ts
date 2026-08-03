/**
 * Enterprise Background Jobs Engine — Production Constants (Module 25.1).
 *
 * Single source of truth for operational timeouts, retry thresholds, batch limits,
 * default queue names, and retention windows across background job components.
 */

/** Default job execution timeout in milliseconds (30 seconds). */
export const DEFAULT_JOB_TIMEOUT = 30000 as const;

/** Default number of retry attempts for failed job executions. */
export const DEFAULT_RETRY_COUNT = 3 as const;

/** Default batch size for bulk job enqueuing and processing. */
export const DEFAULT_BATCH_SIZE = 50 as const;

/** Maximum allowed retry attempts for any background job. */
export const MAX_RETRY_COUNT = 10 as const;

/** Maximum concurrent job workers active per queue instance. */
export const MAX_CONCURRENT_JOBS = 10 as const;

/** Default queue name identifier when omitted. */
export const DEFAULT_QUEUE_NAME = 'default' as const;

/** Default job execution history retention window in days (30 days). */
export const DEFAULT_RETENTION_DAYS = 30 as const;

/** Base path prefix for background job REST API endpoints. */
export const JOBS_BASE_PATH = '/api/v1/jobs' as const;

/** Default pagination page size for job queries. */
export const JOBS_DEFAULT_LIMIT = 20 as const;

/** Maximum pagination page size for job queries. */
export const JOBS_MAX_LIMIT = 1000 as const;
