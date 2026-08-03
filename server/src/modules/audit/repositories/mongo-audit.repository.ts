import mongoose, { Model, PipelineStage } from 'mongoose';
import AuditLogModel, { IAuditLogDocument } from '../models/audit.model';
import { IAuditRepository } from './audit.repository';
import { AuditFilters, AuditPagination, AuditPayload } from '../types/audit.types';
import { AUDIT_DEFAULT_LIMIT, AUDIT_MAX_LIMIT } from '../constants/audit.constants';

/**
 * Enterprise MongoDB Audit Repository Implementation (Module 24.2).
 *
 * Implements IAuditRepository interface contract. Provides optimized query building,
 * lean execution, pagination, bulk operations, and aggregation support.
 */
export class MongoAuditRepository implements IAuditRepository {
  constructor(
    private readonly model: Model<IAuditLogDocument> = AuditLogModel
  ) {}

  /**
   * Reusable query builder converting domain AuditFilters into Mongoose FilterQuery.
   *
   * @param filters Audit criteria filters.
   * @returns Mongoose query filter object.
   */
  private buildQuery(filters: AuditFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {};

    if (filters.actorId) {
      query['actor.userId'] = filters.actorId;
    }

    if (filters.action) {
      if (Array.isArray(filters.action)) {
        query.action = { $in: filters.action };
      } else {
        query.action = filters.action;
      }
    }

    if (filters.entity) {
      if (Array.isArray(filters.entity)) {
        query.entity = { $in: filters.entity };
      } else {
        query.entity = filters.entity;
      }
    }

    if (filters.entityId) {
      query.entityId = filters.entityId;
    }

    if (filters.severity) {
      if (Array.isArray(filters.severity)) {
        query.severity = { $in: filters.severity };
      } else {
        query.severity = filters.severity;
      }
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = { $in: filters.status };
      } else {
        query.status = filters.status;
      }
    }

    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.startDate) dateFilter.$gte = filters.startDate;
      if (filters.endDate) dateFilter.$lte = filters.endDate;
      query.createdAt = dateFilter;
    }

    if (filters.search) {
      const regex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ description: regex }, { errorMessage: regex }];
    }

    if (filters.tags && filters.tags.length > 0) {
      query['metadata.tags'] = { $in: filters.tags };
    }

    if (filters.requestId) {
      query['metadata.requestId'] = filters.requestId;
    }

    if (filters.correlationId) {
      query['metadata.correlationId'] = filters.correlationId;
    }

    return query;
  }

  /**
   * Persists a single audit log document.
   */
  async create(payload: AuditPayload): Promise<IAuditLogDocument> {
    const doc = new this.model({
      actor: payload.actor,
      action: payload.action,
      entity: payload.entity,
      entityId: payload.entityId,
      severity: payload.severity,
      status: payload.status,
      changes: payload.changes || [],
      metadata: payload.metadata || {},
      description: payload.description,
      failureReason: payload.failureReason,
      errorMessage: payload.failureReason,
      createdAt: payload.timestamp || new Date(),
    });

    return doc.save();
  }

  /**
   * Bulk inserts multiple audit log documents.
   */
  async createMany(payloads: AuditPayload[]): Promise<IAuditLogDocument[]> {
    if (!payloads || payloads.length === 0) return [];

    const docs = payloads.map((p) => ({
      actor: p.actor,
      action: p.action,
      entity: p.entity,
      entityId: p.entityId,
      severity: p.severity,
      status: p.status,
      changes: p.changes || [],
      metadata: p.metadata || {},
      description: p.description,
      failureReason: p.failureReason,
      errorMessage: p.failureReason,
      createdAt: p.timestamp || new Date(),
    }));

    const inserted = await this.model.insertMany(docs);
    return inserted as unknown as IAuditLogDocument[];
  }

  /**
   * Retrieves a single audit log by ObjectId string.
   */
  async findById(id: string): Promise<IAuditLogDocument | null> {
    return this.model.findById(id).lean<IAuditLogDocument>().exec();
  }

  /**
   * Queries audit log documents matching criteria with pagination and sorting.
   */
  async find(
    filters: AuditFilters,
    pagination: AuditPagination
  ): Promise<{ items: IAuditLogDocument[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = this.buildQuery(filters);

    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(
      AUDIT_MAX_LIMIT,
      Math.max(1, pagination.limit || AUDIT_DEFAULT_LIMIT)
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
        .lean<IAuditLogDocument[]>()
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
   * Counts audit log documents matching filter criteria.
   */
  async count(filters: AuditFilters): Promise<number> {
    const query = this.buildQuery(filters);
    return this.model.countDocuments(query).exec();
  }

  /**
   * Executes a custom Mongoose aggregate pipeline on the audit log collection.
   */
  async aggregate<T = unknown>(pipeline: PipelineStage[]): Promise<T[]> {
    return this.model.aggregate<T>(pipeline).exec();
  }

  /**
   * Purges audit log documents created prior to a specified date.
   */
  async deleteOlderThan(olderThan: Date): Promise<number> {
    const result = await this.model.deleteMany({ createdAt: { $lt: olderThan } }).exec();
    return result.deletedCount || 0;
  }
}
