import { Request, Response, NextFunction } from 'express';
import { IJobService, IJobStatistics } from '../interfaces/jobs.interfaces';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { IJob } from '../interfaces/jobs.interfaces';
import { JobFilters, JobPagination } from '../types/jobs.types';
import { JobPriority, JobStatus, JobTrigger, JobType } from '../enums/jobs.enums';
import { DEFAULT_RETENTION_DAYS } from '../constants/jobs.constants';

/**
 * Enterprise Background Jobs Controller (Module 25.5).
 *
 * Thin HTTP adapter exposing Background Jobs REST endpoints.
 * Responsibilities:
 * 1. Read validated request query/param/body parameters.
 * 2. Delegate execution strictly to IJobService interface.
 * 3. Return standardized ApiResponse envelopes.
 * 4. Forward unhandled errors to Express next(error) middleware.
 *
 * Contains ZERO business logic.
 */
export class JobsController {
  constructor(private readonly jobService: IJobService) {}

  /**
   * Helper extracting string query parameter safely.
   */
  private qs(req: Request, key: string): string | undefined {
    const raw = req.query[key];
    if (raw === undefined || raw === null) return undefined;
    const value = String(raw).trim();
    return value.length > 0 ? value : undefined;
  }

  /**
   * POST /api/v1/jobs
   * Creates and enqueues a new background job.
   */
  async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, payload, priority, trigger, name, metadata, schedule } = req.body;

      const job = await this.jobService.create(
        {
          type,
          data: payload || {},
          priority,
          tags: metadata?.tags,
        },
        {
          priority,
          tags: metadata?.tags,
        }
      );

      const response: ApiResponse<IJob> = {
        success: true,
        message: 'Background job created and enqueued successfully.',
        data: job,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/jobs
   * Retrieves paginated background jobs matching filters and sorting.
   */
  async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
      const sortBy = this.qs(req, 'sortBy') || 'createdAt';
      const sortOrder = req.query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

      const pagination: JobPagination = { page, limit, sortBy, sortOrder };

      const filters: JobFilters = {
        type: this.qs(req, 'type') as JobType | undefined,
        status: this.qs(req, 'status') as JobStatus | undefined,
        priority: this.qs(req, 'priority') as JobPriority | undefined,
        trigger: this.qs(req, 'trigger') as JobTrigger | undefined,
        queueName: this.qs(req, 'queue'),
        startDate: this.qs(req, 'startDate') ? new Date(this.qs(req, 'startDate')!) : undefined,
        endDate: this.qs(req, 'endDate') ? new Date(this.qs(req, 'endDate')!) : undefined,
        search: this.qs(req, 'search'),
      };

      const result = await this.jobService.find(filters, pagination);

      const response: ApiResponse<{
        items: IJob[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }> = {
        success: true,
        message: 'Background jobs retrieved successfully.',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/jobs/statistics
   * Returns analytical metrics and performance breakdowns for jobs.
   */
  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: JobFilters = {
        startDate: this.qs(req, 'startDate') ? new Date(this.qs(req, 'startDate')!) : undefined,
        endDate: this.qs(req, 'endDate') ? new Date(this.qs(req, 'endDate')!) : undefined,
        type: this.qs(req, 'type') as JobType | undefined,
        queueName: this.qs(req, 'queue'),
      };

      const stats: IJobStatistics = await this.jobService.statistics({ filters });

      const response: ApiResponse<IJobStatistics> = {
        success: true,
        message: 'Job statistics computed successfully.',
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/jobs/:id
   * Retrieves a single background job by ID.
   */
  async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const job = await this.jobService.findById(id);

      if (!job) {
        res.status(404).json({
          success: false,
          message: 'Background job not found.',
        });
        return;
      }

      const response: ApiResponse<IJob> = {
        success: true,
        message: 'Background job retrieved successfully.',
        data: job,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/jobs/:id/retry
   * Re-queues a failed or cancelled job for retry.
   */
  async retryJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const retriedJob = await this.jobService.retry(id);

      const response: ApiResponse<IJob> = {
        success: true,
        message: 'Job queued for retry successfully.',
        data: retriedJob,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/jobs/:id/cancel
   * Cancels a pending or queued job.
   */
  async cancelJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const cancelled = await this.jobService.cancel(id);

      if (!cancelled) {
        res.status(400).json({
          success: false,
          message: 'Unable to cancel job (job may not exist or is already completed/cancelled).',
        });
        return;
      }

      const response: ApiResponse<{ cancelled: boolean; jobId: string }> = {
        success: true,
        message: 'Background job cancelled successfully.',
        data: { cancelled: true, jobId: id },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/jobs/cleanup
   * Purges finished jobs older than specified retention window.
   */
  async cleanupJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { retentionDays = DEFAULT_RETENTION_DAYS, olderThan, dryRun = false } = req.body;

      const cutoffDate = olderThan
        ? new Date(olderThan)
        : new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      if (dryRun) {
        const countResult = await this.jobService.find(
          { endDate: cutoffDate },
          { page: 1, limit: 1 }
        );

        const response: ApiResponse<{
          dryRun: boolean;
          retentionDays: number;
          cutoffDate: Date;
          estimatedDeletions: number;
        }> = {
          success: true,
          message: 'Jobs cleanup dry-run executed successfully.',
          data: {
            dryRun: true,
            retentionDays,
            cutoffDate,
            estimatedDeletions: countResult.total,
          },
        };

        res.status(200).json(response);
        return;
      }

      const deletedCount = await this.jobService.cleanup(cutoffDate);

      const response: ApiResponse<{
        dryRun: boolean;
        retentionDays: number;
        cutoffDate: Date;
        deletedCount: number;
      }> = {
        success: true,
        message: 'Jobs cleanup completed successfully.',
        data: {
          dryRun: false,
          retentionDays,
          cutoffDate,
          deletedCount,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
