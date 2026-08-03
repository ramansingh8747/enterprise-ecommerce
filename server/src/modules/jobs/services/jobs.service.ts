import {
  IJob,
  IJobPayload,
  IJobProvider,
  IJobService,
  IJobStatistics,
} from '../interfaces/jobs.interfaces';
import { IJobRepository } from '../repositories/jobs.repository';
import { IJobDocument } from '../models/job.model';
import {
  JobExecutionOptions,
  JobFilters,
  JobMetrics,
  JobPagination,
  JobSchedule,
  JobSearchOptions,
  JobSummary,
} from '../types/jobs.types';
import { JobPriority, JobStatus, JobTrigger, JobType } from '../enums/jobs.enums';
import {
  DEFAULT_JOB_TIMEOUT,
  DEFAULT_QUEUE_NAME,
  DEFAULT_RETENTION_DAYS,
  DEFAULT_RETRY_COUNT,
  DEFAULT_BATCH_SIZE,
  JOBS_DEFAULT_LIMIT,
  JOBS_MAX_LIMIT,
} from '../constants/jobs.constants';
import { JobContextUtil } from '../utils/job-context.util';
import { JobProvider } from '../providers/jobs.provider';

/**
 * Enterprise Job Application Service Implementation (Module 25.3).
 *
 * Core business application service managing background job creation, lifecycle transitions
 * (cancellation, retry), pagination queries, retention cleanup, and statistical aggregation.
 * Implements IJobService contract (Dependency Inversion Principle).
 */
export class JobService implements IJobService {
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly jobProvider?: IJobProvider
  ) {}

  /* ========================================================================
     PRIVATE VALIDATION & HELPER METHODS
     ====================================================================== */

  /**
   * Validates required fields on incoming job payloads.
   * Throws Error if contract requirements are violated.
   */
  private validatePayload(payload: IJobPayload): void {
    if (!payload) {
      throw new Error('Job payload cannot be null or undefined.');
    }
    if (!payload.type || !Object.values(JobType).includes(payload.type)) {
      throw new Error(`Invalid or missing job type: ${payload.type}`);
    }
    if (!payload.data || typeof payload.data !== 'object') {
      throw new Error('Job data payload must be a non-null object.');
    }
  }

  /**
   * Normalizes schedule parameters for recurring or delayed jobs.
   */
  private normalizeSchedule(schedule?: JobSchedule): JobSchedule | undefined {
    if (!schedule) return undefined;
    return {
      cronExpression: schedule.cronExpression ? schedule.cronExpression.trim() : undefined,
      intervalMs: schedule.intervalMs && schedule.intervalMs > 0 ? schedule.intervalMs : undefined,
      timezone: schedule.timezone || 'UTC',
      enabled: schedule.enabled !== false,
      nextRunAt: schedule.nextRunAt ? new Date(schedule.nextRunAt) : undefined,
    };
  }

  /**
   * Validates whether a job document can be cancelled.
   */
  private validateCancellation(doc: IJobDocument): void {
    if (doc.status === JobStatus.COMPLETED) {
      throw new Error(`Cannot cancel job ${doc.jobId} because it is already COMPLETED.`);
    }
    if (doc.status === JobStatus.CANCELLED) {
      throw new Error(`Job ${doc.jobId} is already CANCELLED.`);
    }
  }

  /**
   * Validates whether a job document can be retried.
   */
  private validateRetry(doc: IJobDocument): void {
    if (doc.status !== JobStatus.FAILED && doc.status !== JobStatus.CANCELLED) {
      throw new Error(`Cannot retry job ${doc.jobId} with status ${doc.status}. Only FAILED or CANCELLED jobs can be retried.`);
    }
    if (doc.execution.attempts >= doc.execution.maxAttempts) {
      throw new Error(`Job ${doc.jobId} has reached maximum retry attempt limit (${doc.execution.maxAttempts}).`);
    }
  }

  /**
   * Maps Mongoose IJobDocument to domain IJob entity.
   */
  private mapDocumentToJob(doc: IJobDocument): IJob {
    return JobProvider.mapDocumentToJob(doc);
  }

  /* ========================================================================
     PUBLIC SERVICE METHODS
     ====================================================================== */

  /**
   * Creates and enqueues a new background job.
   *
   * @param payload Job creation payload.
   * @param options Execution override options.
   */
  async create(payload: IJobPayload, options?: JobExecutionOptions): Promise<IJob> {
    this.validatePayload(payload);

    const jobId = JobContextUtil.generateJobId(payload.type);
    const queue = options?.queueName || payload.queueName || DEFAULT_QUEUE_NAME;
    const priority = options?.priority || payload.priority || JobPriority.NORMAL;
    const timeout = options?.timeout || payload.timeout || DEFAULT_JOB_TIMEOUT;
    const maxAttempts = options?.retryCount ?? payload.maxRetries ?? DEFAULT_RETRY_COUNT;

    const docData: Partial<IJobDocument> = {
      jobId,
      name: `Job:${payload.type}:${jobId}`,
      type: payload.type,
      status: JobStatus.PENDING,
      priority,
      trigger: JobTrigger.MANUAL,
      queue,
      payload: payload.data,
      metadata: {
        source: 'API',
        tags: options?.tags || payload.tags || [],
      },
      execution: {
        attempts: 0,
        maxAttempts,
        duration: timeout,
      },
      progress: 0,
      locked: false,
    };

    const createdDoc = await this.jobRepository.create(docData);
    return this.mapDocumentToJob(createdDoc);
  }

  /**
   * Creates and enqueues multiple background jobs in batch.
   *
   * @param payloads Array of job creation payloads.
   * @param options Execution override options.
   */
  async createMany(payloads: IJobPayload[], options?: JobExecutionOptions): Promise<IJob[]> {
    if (!payloads || payloads.length === 0) return [];

    payloads.forEach((p) => this.validatePayload(p));

    const docs: Partial<IJobDocument>[] = payloads.map((p) => {
      const jobId = JobContextUtil.generateJobId(p.type);
      return {
        jobId,
        name: `Job:${p.type}:${jobId}`,
        type: p.type,
        status: JobStatus.PENDING,
        priority: options?.priority || p.priority || JobPriority.NORMAL,
        trigger: JobTrigger.MANUAL,
        queue: options?.queueName || p.queueName || DEFAULT_QUEUE_NAME,
        payload: p.data,
        metadata: {
          source: 'API',
          tags: options?.tags || p.tags || [],
        },
        execution: {
          attempts: 0,
          maxAttempts: options?.retryCount ?? p.maxRetries ?? DEFAULT_RETRY_COUNT,
          duration: options?.timeout || p.timeout || DEFAULT_JOB_TIMEOUT,
        },
        progress: 0,
        locked: false,
      };
    });

    const results: IJob[] = [];
    for (let i = 0; i < docs.length; i += DEFAULT_BATCH_SIZE) {
      const batch = docs.slice(i, i + DEFAULT_BATCH_SIZE);
      const insertedDocs = await this.jobRepository.createMany(batch);
      results.push(...insertedDocs.map((doc) => this.mapDocumentToJob(doc)));
    }

    return results;
  }

  /**
   * Queries background jobs matching filters and pagination parameters.
   *
   * @param filters Criteria filters.
   * @param pagination Pagination and sorting options.
   */
  async find(
    filters: JobFilters,
    pagination: JobPagination
  ): Promise<{ items: IJob[]; total: number; page: number; limit: number; totalPages: number }> {
    const safePage = Math.max(1, pagination.page || 1);
    const safeLimit = Math.min(
      JOBS_MAX_LIMIT,
      Math.max(1, pagination.limit || JOBS_DEFAULT_LIMIT)
    );

    const safePagination: JobPagination = {
      page: safePage,
      limit: safeLimit,
      sortBy: pagination.sortBy || 'createdAt',
      sortOrder: pagination.sortOrder === 'ASC' ? 'ASC' : 'DESC',
    };

    const result = await this.jobRepository.find(filters, safePagination);

    return {
      items: result.items.map((doc) => this.mapDocumentToJob(doc)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Retrieves a single job by its unique identifier (ObjectId or business jobId).
   *
   * @param id Target job ID string.
   */
  async findById(id: string): Promise<IJob | null> {
    if (!id || typeof id !== 'string' || !id.trim()) {
      return null;
    }
    const cleanId = id.trim();
    const doc = (await this.jobRepository.findByJobId(cleanId)) || (await this.jobRepository.findById(cleanId));
    return doc ? this.mapDocumentToJob(doc) : null;
  }

  /**
   * Cancels a pending or queued background job.
   *
   * @param id Target job ID string.
   */
  async cancel(id: string): Promise<boolean> {
    if (!id || !id.trim()) return false;
    const cleanId = id.trim();
    const doc = (await this.jobRepository.findByJobId(cleanId)) || (await this.jobRepository.findById(cleanId));

    if (!doc) {
      throw new Error(`Job not found with identifier: ${id}`);
    }

    this.validateCancellation(doc);

    const updated = await this.jobRepository.update(doc._id.toString(), {
      status: JobStatus.CANCELLED,
      'execution.completedAt': new Date(),
    } as unknown as Partial<IJobDocument>);

    return !!updated;
  }

  /**
   * Retries a failed or cancelled job.
   *
   * @param id Target job ID string.
   */
  async retry(id: string): Promise<IJob> {
    if (!id || !id.trim()) {
      throw new Error('Target job ID is required for retry operation.');
    }
    const cleanId = id.trim();
    const doc = (await this.jobRepository.findByJobId(cleanId)) || (await this.jobRepository.findById(cleanId));

    if (!doc) {
      throw new Error(`Job not found with identifier: ${id}`);
    }

    this.validateRetry(doc);

    const updated = await this.jobRepository.update(doc._id.toString(), {
      status: JobStatus.RETRYING,
      'execution.attempts': doc.execution.attempts + 1,
    } as unknown as Partial<IJobDocument>);

    if (!updated) {
      throw new Error(`Failed to update retry status for job: ${id}`);
    }

    return this.mapDocumentToJob(updated);
  }

  /**
   * Aggregates statistical metrics on background job executions.
   *
   * @param options Search / filter options for aggregation.
   */
  async statistics(options: JobSearchOptions): Promise<IJobStatistics> {
    const filters = options.filters || {};
    const matchFilter: Record<string, unknown> = {};

    if (filters.startDate || filters.endDate) {
      const range: Record<string, Date> = {};
      if (filters.startDate) range.$gte = filters.startDate;
      if (filters.endDate) range.$lte = filters.endDate;
      matchFilter.createdAt = range;
    }

    const [typeStats, statusStats, priorityStats, queueStats, avgDurationResult, totalCount] =
      await Promise.all([
        this.jobRepository.aggregate<{ _id: string; count: number }>([
          { $match: matchFilter },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
        this.jobRepository.aggregate<{ _id: string; count: number }>([
          { $match: matchFilter },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        this.jobRepository.aggregate<{ _id: string; count: number }>([
          { $match: matchFilter },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
        this.jobRepository.aggregate<{ _id: string; count: number }>([
          { $match: matchFilter },
          { $group: { _id: '$queue', count: { $sum: 1 } } },
        ]),
        this.jobRepository.aggregate<{ avgDuration: number }>([
          { $match: { ...matchFilter, status: JobStatus.COMPLETED } },
          { $group: { _id: null, avgDuration: { $avg: '$execution.duration' } } },
        ]),
        this.jobRepository.count(filters),
      ]);

    const byType: Record<string, number> = {};
    typeStats.forEach((row) => (byType[row._id] = row.count));

    const byStatus: Record<string, number> = {};
    statusStats.forEach((row) => (byStatus[row._id] = row.count));

    const byPriority: Record<string, number> = {};
    priorityStats.forEach((row) => (byPriority[row._id] = row.count));

    const byQueue: Record<string, number> = {};
    queueStats.forEach((row) => (byQueue[row._id] = row.count));

    const completedCount = byStatus[JobStatus.COMPLETED] || 0;
    const failedCount = byStatus[JobStatus.FAILED] || 0;
    const pendingCount = byStatus[JobStatus.PENDING] || 0;
    const runningCount = byStatus[JobStatus.RUNNING] || 0;
    const totalJobs = totalCount;
    const successRate = totalJobs > 0 ? parseFloat(((completedCount / totalJobs) * 100).toFixed(2)) : 100;

    const summary: JobSummary = {
      totalJobs,
      completedCount,
      failedCount,
      pendingCount,
      runningCount,
      successRate,
    };

    const metrics: JobMetrics = {
      totalExecuted: completedCount + failedCount,
      totalFailed: failedCount,
      totalRetried: byStatus[JobStatus.RETRYING] || 0,
      avgDurationMs: parseFloat((avgDurationResult[0]?.avgDuration || 0).toFixed(2)),
      queueDepth: pendingCount + (byStatus[JobStatus.QUEUED] || 0),
      activeWorkers: runningCount,
    };

    return {
      summary,
      metrics,
      byType,
      byStatus,
      byPriority,
      byQueue,
    };
  }

  /**
   * Deletes finished job records older than a cut-off date.
   *
   * @param olderThan Cut-off timestamp.
   */
  async cleanup(olderThan?: Date): Promise<number> {
    const cutoff = olderThan || new Date(Date.now() - DEFAULT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    return this.jobRepository.cleanup(cutoff);
  }
}
