import mongoose, { Model, PipelineStage, Types } from 'mongoose';
import JobModel, { IJobDocument } from '../models/job.model';
import { IJobRepository } from './jobs.repository';
import { JobFilters, JobPagination } from '../types/jobs.types';
import { JOBS_DEFAULT_LIMIT, JOBS_MAX_LIMIT } from '../constants/jobs.constants';
import { JobStatus } from '../enums/jobs.enums';

/**
 * Enterprise MongoDB Job Repository Implementation (Module 25.2).
 *
 * Implements IJobRepository interface contract. Provides reusable query building,
 * lean execution, pagination, bulk operations, and aggregation support.
 */
export class MongoJobsRepository implements IJobRepository {
  constructor(
    private readonly model: Model<IJobDocument> = JobModel
  ) {}

  /**
   * Reusable query builder converting domain JobFilters into Mongoose query filter object.
   *
   * @param filters Job criteria filters.
   * @returns Mongoose query filter object.
   */
  private buildQuery(filters: JobFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {};

    if (filters.type) {
      if (Array.isArray(filters.type)) {
        query.type = { $in: filters.type };
      } else {
        query.type = filters.type;
      }
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = { $in: filters.status };
      } else {
        query.status = filters.status;
      }
    }

    if (filters.priority) {
      if (Array.isArray(filters.priority)) {
        query.priority = { $in: filters.priority };
      } else {
        query.priority = filters.priority;
      }
    }

    if (filters.trigger) {
      if (Array.isArray(filters.trigger)) {
        query.trigger = { $in: filters.trigger };
      } else {
        query.trigger = filters.trigger;
      }
    }

    if (filters.queueName) {
      query.queue = filters.queueName;
    }

    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.startDate) dateFilter.$gte = filters.startDate;
      if (filters.endDate) dateFilter.$lte = filters.endDate;
      query.createdAt = dateFilter;
    }

    if (filters.search) {
      const regex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: regex }, { jobId: regex }, { 'execution.lastError': regex }];
    }

    if (filters.tags && filters.tags.length > 0) {
      query['metadata.tags'] = { $in: filters.tags };
    }

    if (filters.correlationId) {
      query['metadata.correlationId'] = filters.correlationId;
    }

    return query;
  }

  /**
   * Persists a single Job document.
   */
  async create(payload: Partial<IJobDocument>): Promise<IJobDocument> {
    const doc = new this.model(payload);
    return doc.save();
  }

  /**
   * Bulk inserts multiple Job documents.
   */
  async createMany(payloads: Partial<IJobDocument>[]): Promise<IJobDocument[]> {
    if (!payloads || payloads.length === 0) return [];
    const inserted = await this.model.insertMany(payloads);
    return inserted as unknown as IJobDocument[];
  }

  /**
   * Retrieves a single Job document by ObjectId string.
   */
  async findById(id: string): Promise<IJobDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model.findById(id).lean<IJobDocument>().exec();
  }

  /**
   * Retrieves a single Job document by unique jobId string.
   */
  async findByJobId(jobId: string): Promise<IJobDocument | null> {
    if (!jobId || !jobId.trim()) return null;
    return this.model.findOne({ jobId: jobId.trim() }).lean<IJobDocument>().exec();
  }

  /**
   * Queries Job documents matching criteria with pagination and sorting.
   */
  async find(
    filters: JobFilters,
    pagination: JobPagination
  ): Promise<{ items: IJobDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = this.buildQuery(filters);

    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(
      JOBS_MAX_LIMIT,
      Math.max(1, pagination.limit || JOBS_DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const sortField = pagination.sortBy || 'createdAt';
    const sortOrder = pagination.sortOrder === 'ASC' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortOrder };

    const [items, total] = await Promise.all([
      this.model
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean<IJobDocument[]>()
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Updates a Job document by ObjectId string.
   */
  async update(id: string, updateData: Partial<IJobDocument>): Promise<IJobDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .exec();
  }

  /**
   * Deletes a single Job document by ObjectId string.
   */
  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  /**
   * Counts Job documents matching filter criteria.
   */
  async count(filters: JobFilters): Promise<number> {
    const query = this.buildQuery(filters);
    return this.model.countDocuments(query).exec();
  }

  /**
   * Executes a custom Mongoose aggregate pipeline on the jobs collection.
   */
  async aggregate<T = unknown>(pipeline: PipelineStage[]): Promise<T[]> {
    return this.model.aggregate<T>(pipeline).exec();
  }

  /**
   * Purges finished Job documents created prior to a specified date.
   */
  async cleanup(olderThan: Date): Promise<number> {
    const result = await this.model
      .deleteMany({
        createdAt: { $lt: olderThan },
        status: { $in: [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED] },
      })
      .exec();
    return result.deletedCount || 0;
  }
}
