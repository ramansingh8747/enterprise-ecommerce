import { IJob, IJobExecutionResult, IJobScheduler } from '../interfaces/jobs.interfaces';
import { IJobRepository } from '../repositories/jobs.repository';
import { SchedulerEngine } from './scheduler.engine';
import { JobExecutor } from '../executors/job.executor';
import { JobType } from '../enums/jobs.enums';
import { JobSchedule } from '../types/jobs.types';
import { JobService } from '../services/jobs.service';
import { JobProvider } from '../providers/jobs.provider';
import { IJobDocument } from '../models/job.model';

/**
 * Enterprise Job Scheduler Service (Module 25.4).
 *
 * High-level orchestration service managing recurring task schedules, manual triggers,
 * and integration with the SchedulerEngine and JobExecutor.
 * Implements IJobScheduler interface contract.
 */
export class SchedulerService implements IJobScheduler {
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly jobService: JobService,
    private readonly schedulerEngine: SchedulerEngine,
    private readonly jobExecutor: JobExecutor
  ) {}

  /**
   * Initializes the scheduler service and engine loop.
   */
  initialize(): void {
    this.schedulerEngine.initialize();
    this.schedulerEngine.start();
  }

  /**
   * Schedules a new recurring or delayed job.
   *
   * @param type Target JobType classification.
   * @param schedule Schedule definition (cron, interval, nextRunAt).
   * @param payload Input data parameters.
   */
  async scheduleJob(type: JobType, schedule: JobSchedule, payload: Record<string, unknown>): Promise<IJob> {
    const job = await this.jobService.create(
      {
        type,
        data: payload,
      },
      {
        tags: ['scheduled'],
      }
    );

    // Attach schedule subdocument metadata
    const doc = await this.jobRepository.findByJobId(job.id) || await this.jobRepository.findById(job.id);
    if (doc) {
      const updated = await this.jobRepository.update(doc._id.toString(), {
        schedule: {
          runAt: schedule.nextRunAt || new Date(),
          cronExpression: schedule.cronExpression,
          timezone: schedule.timezone || 'UTC',
        },
      } as unknown as Partial<IJobDocument>);

      if (updated) {
        return JobProvider.mapDocumentToJob(updated);
      }
    }

    return job;
  }

  /**
   * Reschedules an existing job with a new schedule definition.
   *
   * @param jobId Target job identifier.
   * @param schedule New schedule definition.
   */
  async reschedule(jobId: string, schedule: JobSchedule): Promise<IJob> {
    const doc = await this.jobRepository.findByJobId(jobId) || await this.jobRepository.findById(jobId);
    if (!doc) {
      throw new Error(`Job not found with identifier: ${jobId}`);
    }

    const updated = await this.jobRepository.update(doc._id.toString(), {
      schedule: {
        runAt: schedule.nextRunAt || new Date(),
        cronExpression: schedule.cronExpression,
        timezone: schedule.timezone || 'UTC',
      },
    } as unknown as Partial<IJobDocument>);

    if (!updated) {
      throw new Error(`Failed to update schedule for job: ${jobId}`);
    }

    return JobProvider.mapDocumentToJob(updated);
  }

  /**
   * Unschedules and cancels a recurring job.
   *
   * @param jobId Target job identifier.
   */
  async unscheduleJob(jobId: string): Promise<boolean> {
    return this.jobService.cancel(jobId);
  }

  /**
   * Manually triggers immediate execution of a job via the JobExecutor.
   *
   * @param jobId Target job identifier.
   */
  async trigger(jobId: string): Promise<IJobExecutionResult> {
    const doc = await this.jobRepository.findByJobId(jobId) || await this.jobRepository.findById(jobId);
    if (!doc) {
      throw new Error(`Job not found with identifier: ${jobId}`);
    }

    this.schedulerEngine.incrementActiveJobs();
    try {
      const result = await this.jobExecutor.executeJob(doc);
      return result;
    } finally {
      this.schedulerEngine.decrementActiveJobs();
    }
  }

  /**
   * Gracefully shuts down the scheduler service and engine loop.
   */
  async shutdown(): Promise<void> {
    await this.schedulerEngine.shutdown();
  }
}
