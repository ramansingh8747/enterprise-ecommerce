import { IJobContext, IJobExecutionResult } from '../interfaces/jobs.interfaces';
import { IJobRepository } from '../repositories/jobs.repository';
import { WorkerRegistry, globalWorkerRegistry } from '../workers/worker.registry';
import { IJobDocument } from '../models/job.model';
import { JobStatus } from '../enums/jobs.enums';
import { JobLifecycleManager } from '../lifecycle/job.lifecycle';
import { JobContextUtil } from '../utils/job-context.util';

/**
 * Enterprise Job Executor Pipeline (Module 25.4).
 *
 * Handles task execution orchestration, worker resolution, concurrency locks,
 * execution timing, state transitions, and result mapping.
 */
export class JobExecutor {
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly workerRegistry: WorkerRegistry = globalWorkerRegistry
  ) {}

  /**
   * Executes a single background job document safely through its lifecycle pipeline.
   *
   * @param job Target IJobDocument record.
   * @param overrideContext Optional context overrides.
   * @returns Produced IJobExecutionResult.
   */
  async executeJob(job: IJobDocument, overrideContext?: IJobContext): Promise<IJobExecutionResult> {
    const startTime = Date.now();
    const context: IJobContext =
      overrideContext ||
      JobContextUtil.buildContext(job.queue, job.trigger, job.metadata?.requestId, job.metadata?.correlationId, job.metadata?.createdBy);

    // 1. Resolve registered worker for job.type
    const worker = this.workerRegistry.getWorker(job.type);
    if (!worker) {
      const errorMsg = `No worker registered for JobType '${job.type}'. Job ID: ${job.jobId}`;
      await this.handleExecutionFailure(job, new Error(errorMsg), Date.now() - startTime);
      return {
        jobId: job.jobId,
        status: JobStatus.FAILED,
        durationMs: Date.now() - startTime,
        error: errorMsg,
        finishedAt: new Date(),
      };
    }

    // 2. Validate state transition to RUNNING & acquire lock
    try {
      JobLifecycleManager.validateTransition(job.jobId, job.status, JobStatus.RUNNING);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        jobId: job.jobId,
        status: JobStatus.FAILED,
        durationMs: Date.now() - startTime,
        error: error.message,
        finishedAt: new Date(),
      };
    }

    await this.jobRepository.update(job._id.toString(), {
      status: JobStatus.RUNNING,
      locked: true,
      lockedAt: new Date(),
      'execution.startedAt': new Date(),
      'execution.attempts': (job.execution?.attempts || 0) + 1,
    } as unknown as Partial<IJobDocument>);

    let resultData: Record<string, unknown> | undefined;

    // 3. Execute Worker Task with Lifecycle Hooks
    try {
      if (worker.beforeExecute) {
        await worker.beforeExecute(job.jobId, job.payload || {}, context);
      }

      resultData = await worker.execute(job.payload || {}, context);

      if (worker.afterExecute) {
        await worker.afterExecute(job.jobId, resultData, context);
      }

      if (worker.onSuccess) {
        await worker.onSuccess(job.jobId, resultData, context);
      }

      const durationMs = Date.now() - startTime;
      const finishedAt = new Date();

      // Update state to COMPLETED & release lock
      await this.jobRepository.update(job._id.toString(), {
        status: JobStatus.COMPLETED,
        progress: 100,
        result: resultData,
        locked: false,
        'execution.completedAt': finishedAt,
        'execution.duration': durationMs,
      } as unknown as Partial<IJobDocument>);

      return {
        jobId: job.jobId,
        status: JobStatus.COMPLETED,
        durationMs,
        resultData,
        finishedAt,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const durationMs = Date.now() - startTime;

      if (worker.onFailure) {
        try {
          await worker.onFailure(job.jobId, error, context);
        } catch {
          // Ignore lifecycle hook failure
        }
      }

      await this.handleExecutionFailure(job, error, durationMs);

      return {
        jobId: job.jobId,
        status: JobStatus.FAILED,
        durationMs,
        error: error.message,
        finishedAt: new Date(),
      };
    }
  }

  /**
   * Helper handling execution failure persistence and lock release.
   */
  private async handleExecutionFailure(
    job: IJobDocument,
    error: Error,
    durationMs: number
  ): Promise<void> {
    const finishedAt = new Date();
    await this.jobRepository.update(job._id.toString(), {
      status: JobStatus.FAILED,
      locked: false,
      'execution.completedAt': finishedAt,
      'execution.duration': durationMs,
      'execution.lastError': error.message,
    } as unknown as Partial<IJobDocument>);
  }
}
