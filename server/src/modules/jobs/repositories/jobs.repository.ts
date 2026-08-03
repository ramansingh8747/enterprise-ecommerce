import { PipelineStage } from 'mongoose';
import { IJobDocument } from '../models/job.model';
import { JobFilters, JobPagination } from '../types/jobs.types';

/**
 * Enterprise Job Repository Contract (Module 25.2).
 *
 * Defines all database query and persistence signatures for Background Job records.
 * Implementations delegate to MongoDB queries and aggregations.
 * Services depend on this interface (Dependency Inversion Principle).
 */
export interface IJobRepository {
  /**
   * Persists a single Job document.
   *
   * @param payload Job document fields.
   * @returns Persisted IJobDocument.
   */
  create(payload: Partial<IJobDocument>): Promise<IJobDocument>;

  /**
   * Bulk inserts multiple Job documents.
   *
   * @param payloads Array of Job document fields.
   * @returns Array of persisted IJobDocuments.
   */
  createMany(payloads: Partial<IJobDocument>[]): Promise<IJobDocument[]>;

  /**
   * Retrieves a single Job document by ObjectId string.
   *
   * @param id Job document ObjectId.
   * @returns IJobDocument or null.
   */
  findById(id: string): Promise<IJobDocument | null>;

  /**
   * Retrieves a single Job document by unique jobId string.
   *
   * @param jobId Unique business job ID string.
   * @returns IJobDocument or null.
   */
  findByJobId(jobId: string): Promise<IJobDocument | null>;

  /**
   * Queries Job documents matching criteria with pagination and sorting.
   *
   * @param filters Criteria filters.
   * @param pagination Pagination and sorting options.
   * @returns Paginated result object containing items and metadata.
   */
  find(
    filters: JobFilters,
    pagination: JobPagination
  ): Promise<{ items: IJobDocument[]; total: number; page: number; limit: number; totalPages: number }>;

  /**
   * Updates a Job document by ObjectId string.
   *
   * @param id Target Job ObjectId string.
   * @param updateData Partial fields to update.
   * @returns Updated IJobDocument or null.
   */
  update(id: string, updateData: Partial<IJobDocument>): Promise<IJobDocument | null>;

  /**
   * Deletes a single Job document by ObjectId string.
   *
   * @param id Target Job ObjectId string.
   * @returns True if deleted, false if not found.
   */
  delete(id: string): Promise<boolean>;

  /**
   * Counts Job documents matching filter criteria.
   *
   * @param filters Criteria filters.
   * @returns Matching document count.
   */
  count(filters: JobFilters): Promise<number>;

  /**
   * Executes a custom Mongoose aggregate pipeline on the jobs collection.
   *
   * @param pipeline MongoDB aggregation pipeline stages.
   * @returns Aggregation result array.
   */
  aggregate<T = unknown>(pipeline: PipelineStage[]): Promise<T[]>;

  /**
   * Purges finished Job documents created prior to a specified date.
   *
   * @param olderThan Cut-off timestamp.
   * @returns Number of deleted records.
   */
  cleanup(olderThan: Date): Promise<number>;
}
