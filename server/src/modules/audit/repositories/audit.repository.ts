import { PipelineStage } from 'mongoose';
import { IAuditLogDocument } from '../models/audit.model';
import { AuditFilters, AuditPagination, AuditPayload } from '../types/audit.types';

/**
 * Enterprise Audit Repository Contract (Module 24.2).
 *
 * Defines all database query and persistence signatures for Audit Log records.
 * Implementations delegate to MongoDB aggregation/queries.
 * Services depend on this interface (Dependency Inversion Principle).
 */
export interface IAuditRepository {
  /**
   * Persists a single audit log document.
   *
   * @param payload Audit log input payload.
   * @returns Persisted IAuditLogDocument.
   */
  create(payload: AuditPayload): Promise<IAuditLogDocument>;

  /**
   * Bulk inserts multiple audit log documents.
   *
   * @param payloads Array of audit log input payloads.
   * @returns Array of persisted IAuditLogDocuments.
   */
  createMany(payloads: AuditPayload[]): Promise<IAuditLogDocument[]>;

  /**
   * Retrieves a single audit log by its unique ObjectId string.
   *
   * @param id Audit document ObjectId string.
   * @returns IAuditLogDocument or null if not found.
   */
  findById(id: string): Promise<IAuditLogDocument | null>;

  /**
   * Queries audit log documents matching criteria with pagination and sorting.
   *
   * @param filters Audit filter options.
   * @param pagination Pagination and sorting options.
   * @returns Paginated result object containing items and metadata.
   */
  find(
    filters: AuditFilters,
    pagination: AuditPagination
  ): Promise<{ items: IAuditLogDocument[]; total: number; page: number; limit: number; totalPages: number }>;

  /**
   * Counts audit log documents matching filter criteria.
   *
   * @param filters Audit filter options.
   * @returns Matching document count.
   */
  count(filters: AuditFilters): Promise<number>;

  /**
   * Executes a custom Mongoose aggregate pipeline on the audit log collection.
   *
   * @param pipeline MongoDB aggregation pipeline stages.
   * @returns Aggregation result array.
   */
  aggregate<T = unknown>(pipeline: PipelineStage[]): Promise<T[]>;

  /**
   * Purges audit log documents created prior to a specified date.
   *
   * @param olderThan Cut-off timestamp.
   * @returns Number of deleted records.
   */
  deleteOlderThan(olderThan: Date): Promise<number>;
}
