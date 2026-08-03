import {
  JobPriority,
  JobStatus,
  JobTrigger,
  JobType,
} from '../enums/jobs.enums';
import {
  JobExecutionOptions,
  JobFilters,
  JobHistory,
  JobPagination,
  JobSchedule,
  JobSearchOptions,
  JobStatistics as JobStatisticsType,
} from '../types/jobs.types';

/**
 * Enterprise Background Jobs Engine — Domain Interfaces (Module 25.1).
 *
 * Strongly typed, framework-agnostic interfaces establishing contracts
 * for job entities, contexts, execution results, providers, schedulers, and services.
 */

/**
 * Contextual metadata attached to a job execution attempt.
 */
export interface IJobContext {
  /** Unique job execution context ID. */
  contextId: string;
  /** Primary queue name handling this execution. */
  queueName: string;
  /** Trigger origin initiating this execution. */
  trigger: JobTrigger;
  /** Request tracking ID if initiated via HTTP request. */
  requestId?: string;
  /** Distributed correlation ID across system services. */
  correlationId?: string;
  /** User ID of the actor initiating the job if applicable. */
  initiatedBy?: string;
}

/**
 * Payload parameters required to define a new background job.
 */
export interface IJobPayload {
  /** Job classification type. */
  type: JobType;
  /** Target queue name (defaults to 'default'). */
  queueName?: string;
  /** Priority level. */
  priority?: JobPriority;
  /** Custom payload input data passed to the job worker. */
  data: Record<string, unknown>;
  /** Optional execution delay in milliseconds. */
  delayMs?: number;
  /** Execution timeout in milliseconds. */
  timeout?: number;
  /** Retry attempt limit. */
  maxRetries?: number;
  /** Classification tags. */
  tags?: string[];
}

/**
 * Result data returned following a completed or failed job execution.
 */
export interface IJobExecutionResult {
  /** Target job ID. */
  jobId: string;
  /** Execution status (COMPLETED | FAILED). */
  status: JobStatus;
  /** Execution duration in milliseconds. */
  durationMs: number;
  /** Output data produced by the worker on completion. */
  resultData?: Record<string, unknown>;
  /** Error message if execution failed. */
  error?: string;
  /** Timestamp when execution finished. */
  finishedAt: Date;
}

/**
 * Full domain entity model representing a Background Job.
 */
export interface IJob {
  /** Unique job identifier. */
  id: string;
  /** Job classification type. */
  type: JobType;
  /** Target queue name. */
  queueName: string;
  /** Current execution status. */
  status: JobStatus;
  /** Priority level. */
  priority: JobPriority;
  /** Trigger origin. */
  trigger: JobTrigger;
  /** Input parameters payload. */
  data: Record<string, unknown>;
  /** Current attempt count. */
  attempts: number;
  /** Maximum retry limit. */
  maxRetries: number;
  /** Execution timeout in milliseconds. */
  timeout: number;
  /** Execution context metadata. */
  context: IJobContext;
  /** Optional schedule definition for recurring jobs. */
  schedule?: JobSchedule;
  /** History array of past execution attempts. */
  history: JobHistory[];
  /** Latest execution output result. */
  result?: IJobExecutionResult;
  /** Failure error message if status is FAILED. */
  failureReason?: string;
  /** Scheduled execution timestamp. */
  scheduledAt?: Date;
  /** Timestamp when execution started. */
  startedAt?: Date;
  /** Timestamp when execution finished. */
  finishedAt?: Date;
  /** Timestamp when job was created. */
  createdAt: Date;
  /** Timestamp when job was last updated. */
  updatedAt: Date;
}

/**
 * Re-export of job statistics contract for service interfaces.
 */
export type IJobStatistics = JobStatisticsType;

/**
 * Low-level Job Queue Provider contract for enqueueing and transport operations.
 */
export interface IJobProvider {
  /**
   * Enqueues a single background job payload into the processing queue.
   *
   * @param payload Job payload definition.
   * @param options Execution override options.
   */
  enqueue(payload: IJobPayload, options?: JobExecutionOptions): Promise<IJob>;

  /**
   * Enqueues multiple background job payloads in bulk.
   *
   * @param payloads Array of job payload definitions.
   * @param options Execution override options.
   */
  enqueueMany(payloads: IJobPayload[], options?: JobExecutionOptions): Promise<IJob[]>;

  /**
   * Cancels a pending or queued job.
   *
   * @param jobId Target job ID.
   */
  cancel(jobId: string): Promise<boolean>;

  /**
   * Re-queues a failed job for a retry attempt.
   *
   * @param jobId Target job ID.
   */
  retry(jobId: string): Promise<IJob>;

  /**
   * Pauses queue processing.
   *
   * @param queueName Target queue name.
   */
  pause(queueName?: string): Promise<void>;

  /**
   * Resumes queue processing.
   *
   * @param queueName Target queue name.
   */
  resume(queueName?: string): Promise<void>;

  /**
   * Gracefully shuts down provider connections.
   */
  shutdown(): Promise<void>;
}

/**
 * Job Scheduler contract for recurring cron / interval tasks.
 */
export interface IJobScheduler {
  /**
   * Schedules a recurring job using a cron expression or interval.
   *
   * @param type Job type.
   * @param schedule Schedule definition options.
   * @param payload Input data payload.
   */
  scheduleJob(type: JobType, schedule: JobSchedule, payload: Record<string, unknown>): Promise<IJob>;

  /**
   * Unschedules and removes a recurring job schedule.
   *
   * @param jobId Target job ID.
   */
  unscheduleJob(jobId: string): Promise<boolean>;
}

/**
 * High-level Job Application Service contract (Dependency Inversion Principle).
 */
export interface IJobService {
  /**
   * Creates and enqueues a new background job.
   *
   * @param payload Job creation payload.
   * @param options Execution override options.
   */
  create(payload: IJobPayload, options?: JobExecutionOptions): Promise<IJob>;

  /**
   * Creates and enqueues multiple background jobs in bulk.
   *
   * @param payloads Array of job creation payloads.
   * @param options Execution override options.
   */
  createMany(payloads: IJobPayload[], options?: JobExecutionOptions): Promise<IJob[]>;

  /**
   * Queries background jobs matching filters and pagination.
   *
   * @param filters Criteria filters.
   * @param pagination Pagination and sorting options.
   */
  find(
    filters: JobFilters,
    pagination: JobPagination
  ): Promise<{ items: IJob[]; total: number; page: number; limit: number; totalPages: number }>;

  /**
   * Retrieves a single job by its unique identifier.
   *
   * @param id Target job ID.
   */
  findById(id: string): Promise<IJob | null>;

  /**
   * Cancels a pending or queued background job.
   *
   * @param id Target job ID.
   */
  cancel(id: string): Promise<boolean>;

  /**
   * Retries a failed job.
   *
   * @param id Target job ID.
   */
  retry(id: string): Promise<IJob>;

  /**
   * Aggregates statistical metrics on background job executions.
   *
   * @param options Search / filter options for aggregation.
   */
  statistics(options: JobSearchOptions): Promise<IJobStatistics>;

  /**
   * Deletes finished job records older than a cut-off date.
   *
   * @param olderThan Cut-off timestamp.
   */
  cleanup(olderThan: Date): Promise<number>;
}
