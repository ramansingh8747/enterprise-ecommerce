import { IJob, IJobPayload, IJobProvider } from '../interfaces/jobs.interfaces';
import { IJobRepository } from '../repositories/jobs.repository';
import { JobExecutionOptions } from '../types/jobs.types';
import { IJobDocument } from '../models/job.model';
import { JobContextUtil } from '../utils/job-context.util';
import { JobPriority, JobStatus, JobTrigger } from '../enums/jobs.enums';
import { DEFAULT_JOB_TIMEOUT, DEFAULT_QUEUE_NAME, DEFAULT_RETRY_COUNT } from '../constants/jobs.constants';

/**
 * Enterprise Job Queue Provider Implementation (Module 25.3).
 *
 * Implements IJobProvider transport contract by delegating persistence and state operations
 * to the underlying IJobRepository abstraction.
 */
export class JobProvider implements IJobProvider {
  constructor(private readonly jobRepository: IJobRepository) {}

  /**
   * Helper mapping Mongoose IJobDocument to clean domain IJob object.
   */
  static mapDocumentToJob(doc: IJobDocument): IJob {
    return {
      id: doc._id.toString(),
      type: doc.type,
      queueName: doc.queue,
      status: doc.status,
      priority: doc.priority,
      trigger: doc.trigger,
      data: doc.payload || {},
      attempts: doc.execution?.attempts || 0,
      maxRetries: doc.execution?.maxAttempts || DEFAULT_RETRY_COUNT,
      timeout: doc.execution?.duration || DEFAULT_JOB_TIMEOUT,
      context: {
        contextId: doc.metadata?.requestId || `ctx-${doc._id.toString()}`,
        queueName: doc.queue,
        trigger: doc.trigger,
        requestId: doc.metadata?.requestId,
        correlationId: doc.metadata?.correlationId,
        initiatedBy: doc.metadata?.createdBy,
      },
      schedule: doc.schedule
        ? {
            nextRunAt: doc.schedule.runAt,
            cronExpression: doc.schedule.cronExpression,
            timezone: doc.schedule.timezone,
            enabled: true,
          }
        : undefined,
      history: [],
      result: doc.result
        ? {
            jobId: doc.jobId,
            status: doc.status,
            durationMs: doc.execution?.duration || 0,
            resultData: doc.result,
            error: doc.execution?.lastError,
            finishedAt: doc.execution?.completedAt || doc.updatedAt,
          }
        : undefined,
      failureReason: doc.execution?.lastError,
      scheduledAt: doc.schedule?.runAt,
      startedAt: doc.execution?.startedAt,
      finishedAt: doc.execution?.completedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Enqueues a single background job payload into the database queue.
   *
   * @param payload Job payload definition.
   * @param options Execution override options.
   */
  async enqueue(payload: IJobPayload, options?: JobExecutionOptions): Promise<IJob> {
    const jobId = JobContextUtil.generateJobId(payload.type);
    const queue = options?.queueName || payload.queueName || DEFAULT_QUEUE_NAME;
    const priority = options?.priority || payload.priority || JobPriority.NORMAL;
    const timeout = options?.timeout || payload.timeout || DEFAULT_JOB_TIMEOUT;
    const maxAttempts = options?.retryCount ?? payload.maxRetries ?? DEFAULT_RETRY_COUNT;

    const docData: Partial<IJobDocument> = {
      jobId,
      name: `Job:${payload.type}:${jobId}`,
      type: payload.type,
      status: JobStatus.QUEUED,
      priority,
      trigger: JobTrigger.MANUAL,
      queue,
      payload: payload.data || {},
      metadata: {
        source: 'SYSTEM',
        tags: options?.tags || payload.tags || [],
      },
      execution: {
        attempts: 0,
        maxAttempts,
      },
      progress: 0,
      locked: false,
    };

    const created = await this.jobRepository.create(docData);
    return JobProvider.mapDocumentToJob(created);
  }

  /**
   * Enqueues multiple background job payloads in bulk.
   *
   * @param payloads Array of job payload definitions.
   * @param options Execution override options.
   */
  async enqueueMany(payloads: IJobPayload[], options?: JobExecutionOptions): Promise<IJob[]> {
    if (!payloads || payloads.length === 0) return [];

    const docs = payloads.map((p) => {
      const jobId = JobContextUtil.generateJobId(p.type);
      return {
        jobId,
        name: `Job:${p.type}:${jobId}`,
        type: p.type,
        status: JobStatus.QUEUED,
        priority: options?.priority || p.priority || JobPriority.NORMAL,
        trigger: JobTrigger.MANUAL,
        queue: options?.queueName || p.queueName || DEFAULT_QUEUE_NAME,
        payload: p.data || {},
        metadata: {
          source: 'SYSTEM',
          tags: options?.tags || p.tags || [],
        },
        execution: {
          attempts: 0,
          maxAttempts: options?.retryCount ?? p.maxRetries ?? DEFAULT_RETRY_COUNT,
        },
        progress: 0,
        locked: false,
      };
    });

    const insertedDocs = await this.jobRepository.createMany(docs);
    return insertedDocs.map((doc) => JobProvider.mapDocumentToJob(doc));
  }

  /**
   * Cancels a pending or queued job.
   *
   * @param jobId Target job ID string or ObjectId.
   */
  async cancel(jobId: string): Promise<boolean> {
    const doc = await this.jobRepository.findByJobId(jobId) || await this.jobRepository.findById(jobId);
    if (!doc) return false;
    if (doc.status === JobStatus.COMPLETED || doc.status === JobStatus.CANCELLED) {
      return false;
    }

    const updated = await this.jobRepository.update(doc._id.toString(), {
      status: JobStatus.CANCELLED,
      'execution.completedAt': new Date(),
    } as unknown as Partial<IJobDocument>);

    return !!updated;
  }

  /**
   * Re-queues a failed job for a retry attempt.
   *
   * @param jobId Target job ID string or ObjectId.
   */
  async retry(jobId: string): Promise<IJob> {
    const doc = await this.jobRepository.findByJobId(jobId) || await this.jobRepository.findById(jobId);
    if (!doc) {
      throw new Error(`Job not found: ${jobId}`);
    }

    if (doc.execution.attempts >= doc.execution.maxAttempts) {
      throw new Error(`Job ${jobId} has reached maximum retry attempt limit (${doc.execution.maxAttempts}).`);
    }

    const updated = await this.jobRepository.update(doc._id.toString(), {
      status: JobStatus.RETRYING,
      'execution.attempts': doc.execution.attempts + 1,
    } as unknown as Partial<IJobDocument>);

    if (!updated) {
      throw new Error(`Failed to update retry status for job: ${jobId}`);
    }

    return JobProvider.mapDocumentToJob(updated);
  }

  /**
   * Pauses queue processing.
   */
  async pause(_queueName?: string): Promise<void> {
    // Queue pause stub
  }

  /**
   * Resumes queue processing.
   */
  async resume(_queueName?: string): Promise<void> {
    // Queue resume stub
  }

  /**
   * Gracefully shuts down provider connections.
   */
  async shutdown(): Promise<void> {
    // Provider shutdown stub
  }
}
