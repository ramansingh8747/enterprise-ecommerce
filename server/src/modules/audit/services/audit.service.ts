import { IAuditService } from '../interfaces/audit.interface';
import { IAuditRepository } from '../repositories/audit.repository';
import { IAuditLogDocument } from '../models/audit.model';
import {
  AuditFilters,
  AuditPagination,
  AuditPayload,
  AuditRecord,
  AuditSearchOptions,
  AuditStatistics,
  AuditSummary,
} from '../types/audit.types';
import { AuditAction, AuditEntity, AuditSeverity, AuditStatus } from '../enums/audit.enums';
import {
  AUDIT_DEFAULT_LIMIT,
  AUDIT_MAX_LIMIT,
  DEFAULT_RETENTION_DAYS,
  AUDIT_BATCH_SIZE,
  MAX_CHANGES_TRACKED,
  MAX_METADATA_SIZE,
} from '../constants/audit.constants';
import { IAuditChange, IAuditMetadata } from '../interfaces/audit.interface';

/**
 * Enterprise Audit Service Implementation (Module 24.3).
 *
 * Core business application service managing audit event ingestion, query filtering,
 * aggregation metrics, exporting, and retention cleanup.
 * Implements IAuditService contract (Dependency Inversion Principle).
 */
export class AuditService implements IAuditService {
  constructor(private readonly auditRepository: IAuditRepository) {}

  /* ========================================================================
     PRIVATE VALIDATION & SANITIZATION HELPERS
     ====================================================================== */

  /**
   * Validates required fields on incoming audit payloads.
   * Throws Error if contract requirements are violated.
   */
  private validatePayload(payload: AuditPayload): void {
    if (!payload) {
      throw new Error('Audit payload cannot be null or undefined.');
    }
    if (!payload.action || !Object.values(AuditAction).includes(payload.action)) {
      throw new Error(`Invalid or missing audit action: ${payload.action}`);
    }
    if (!payload.entity || !Object.values(AuditEntity).includes(payload.entity)) {
      throw new Error(`Invalid or missing audit entity: ${payload.entity}`);
    }
    if (!payload.actor || !payload.actor.userId || !payload.actor.email) {
      throw new Error('Audit actor must include userId and email.');
    }
    if (!payload.description || typeof payload.description !== 'string' || !payload.description.trim()) {
      throw new Error('Audit description is required.');
    }
  }

  /**
   * Trims metadata object if stringified size exceeds MAX_METADATA_SIZE.
   */
  private sanitizeMetadata(metadata?: IAuditMetadata): IAuditMetadata | undefined {
    if (!metadata) return undefined;

    const copy: IAuditMetadata = { ...metadata };
    const str = JSON.stringify(copy);

    if (str.length > MAX_METADATA_SIZE && copy.extra) {
      // Trim extra properties to fit budget
      copy.extra = { warning: 'Metadata payload trimmed due to size limit' };
    }

    return copy;
  }

  /**
   * Enforces max tracked changes limit to prevent memory bloating.
   */
  private normalizeChanges(changes?: IAuditChange[]): IAuditChange[] | undefined {
    if (!changes || changes.length === 0) return undefined;
    if (changes.length > MAX_CHANGES_TRACKED) {
      return changes.slice(0, MAX_CHANGES_TRACKED);
    }
    return changes;
  }

  /**
   * Prepares and normalizes a complete AuditPayload with defaults.
   */
  private buildNormalizedPayload(payload: AuditPayload): AuditPayload {
    this.validatePayload(payload);

    return {
      action: payload.action,
      entity: payload.entity,
      entityId: payload.entityId ? String(payload.entityId).trim() : undefined,
      actor: {
        userId: String(payload.actor.userId).trim(),
        email: String(payload.actor.email).trim().toLowerCase(),
        role: payload.actor.role || 'USER',
        ipAddress: payload.actor.ipAddress,
        userAgent: payload.actor.userAgent,
      },
      severity: payload.severity || AuditSeverity.LOW,
      status: payload.status || AuditStatus.SUCCESS,
      changes: this.normalizeChanges(payload.changes),
      metadata: this.sanitizeMetadata(payload.metadata),
      timestamp: payload.timestamp || new Date(),
      description: payload.description.trim(),
      failureReason: payload.failureReason ? payload.failureReason.trim() : undefined,
    };
  }

  /**
   * Maps Mongoose IAuditLogDocument to clean domain AuditRecord interface.
   */
  private mapDocumentToRecord(doc: IAuditLogDocument): AuditRecord {
    return {
      id: doc._id.toString(),
      action: doc.action,
      entity: doc.entity,
      entityId: doc.entityId,
      actor: {
        userId: doc.actor.userId,
        email: doc.actor.email,
        role: doc.actor.role,
        userAgent: doc.metadata?.userAgent,
        ipAddress: doc.metadata?.ip,
      },
      severity: doc.severity,
      status: doc.status,
      changes: doc.changes
        ? doc.changes.map((c) => ({
            field: c.field,
            oldValue: c.before,
            newValue: c.after,
          }))
        : [],
      metadata: {
        ip: doc.metadata?.ip,
        userAgent: doc.metadata?.userAgent,
        requestId: doc.metadata?.requestId,
        correlationId: doc.metadata?.correlationId,
        tags: doc.metadata?.tags,
        extra: doc.metadata?.additionalData,
      },
      timestamp: doc.createdAt || new Date(),
      description: doc.description,
      failureReason: doc.errorMessage,
    };
  }

  /* ========================================================================
     PUBLIC SERVICE METHODS
     ====================================================================== */

  /**
   * Records a single audit event entry.
   *
   * @param payload Audit record payload.
   * @returns Persisted AuditRecord.
   */
  async record(payload: AuditPayload): Promise<AuditRecord> {
    const normalized = this.buildNormalizedPayload(payload);
    const createdDoc = await this.auditRepository.create(normalized);
    return this.mapDocumentToRecord(createdDoc);
  }

  /**
   * Records multiple audit event entries in batches.
   *
   * @param payloads Array of audit record payloads.
   * @returns Array of persisted AuditRecords.
   */
  async recordMany(payloads: AuditPayload[]): Promise<AuditRecord[]> {
    if (!payloads || payloads.length === 0) return [];

    const normalizedList = payloads.map((p) => this.buildNormalizedPayload(p));
    const results: AuditRecord[] = [];

    // Process in chunks of AUDIT_BATCH_SIZE
    for (let i = 0; i < normalizedList.length; i += AUDIT_BATCH_SIZE) {
      const batch = normalizedList.slice(i, i + AUDIT_BATCH_SIZE);
      const insertedDocs = await this.auditRepository.createMany(batch);
      const records = insertedDocs.map((doc) => this.mapDocumentToRecord(doc));
      results.push(...records);
    }

    return results;
  }

  /**
   * Queries audit logs matching filter and pagination parameters.
   *
   * @param filters Criteria filters.
   * @param pagination Pagination and sorting options.
   */
  async find(
    filters: AuditFilters,
    pagination: AuditPagination
  ): Promise<{ items: AuditRecord[]; total: number; page: number; limit: number; totalPages: number }> {
    const safePage = Math.max(1, pagination.page || 1);
    const safeLimit = Math.min(
      AUDIT_MAX_LIMIT,
      Math.max(1, pagination.limit || AUDIT_DEFAULT_LIMIT)
    );

    const safePagination: AuditPagination = {
      page: safePage,
      limit: safeLimit,
      sortBy: pagination.sortBy || 'createdAt',
      sortOrder: pagination.sortOrder === 'ASC' ? 'ASC' : 'DESC',
    };

    const result = await this.auditRepository.find(filters, safePagination);

    return {
      items: result.items.map((doc) => this.mapDocumentToRecord(doc)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Retrieves a single audit record by its unique identifier.
   *
   * @param id Audit record ObjectId string.
   */
  async findById(id: string): Promise<AuditRecord | null> {
    if (!id || typeof id !== 'string' || !id.trim()) {
      return null;
    }
    const doc = await this.auditRepository.findById(id.trim());
    return doc ? this.mapDocumentToRecord(doc) : null;
  }

  /**
   * Aggregates statistical metrics on audit logs within a time range.
   *
   * @param options Search / filter options for aggregation.
   * @returns Summary statistics object.
   */
  async statistics(options: AuditSearchOptions): Promise<AuditStatistics> {
    const filters = options.filters || {};
    const matchFilter: Record<string, unknown> = {};

    if (filters.startDate || filters.endDate) {
      const range: Record<string, Date> = {};
      if (filters.startDate) range.$gte = filters.startDate;
      if (filters.endDate) range.$lte = filters.endDate;
      matchFilter.createdAt = range;
    }

    // Parallel aggregation pipelines for stats distribution
    const [actionStats, entityStats, severityStats, statusStats, timeSeriesStats, totalCountResult, uniqueActorResult] =
      await Promise.all([
        this.auditRepository.aggregate<{ _id: string; count: number }>([
          { $match: matchFilter },
          { $group: { _id: '$action', count: { $sum: 1 } } },
        ]),
        this.auditRepository.aggregate<{ _id: string; count: number }>([
          { $match: matchFilter },
          { $group: { _id: '$entity', count: { $sum: 1 } } },
        ]),
        this.auditRepository.aggregate<{ _id: string; count: number }>([
          { $match: matchFilter },
          { $group: { _id: '$severity', count: { $sum: 1 } } },
        ]),
        this.auditRepository.aggregate<{ _id: string; count: number }>([
          { $match: matchFilter },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        this.auditRepository.aggregate<{ _id: string; count: number }>([
          { $match: matchFilter },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        this.auditRepository.count(filters),
        this.auditRepository.aggregate<{ count: number }>([
          { $match: matchFilter },
          { $group: { _id: '$actor.userId' } },
          { $count: 'count' },
        ]),
      ]);

    const byAction: Record<string, number> = {};
    actionStats.forEach((row) => (byAction[row._id] = row.count));

    const byEntity: Record<string, number> = {};
    entityStats.forEach((row) => (byEntity[row._id] = row.count));

    const bySeverity: Record<string, number> = {};
    severityStats.forEach((row) => (bySeverity[row._id] = row.count));

    const byStatus: Record<string, number> = {};
    statusStats.forEach((row) => (byStatus[row._id] = row.count));

    const successCount = byStatus[AuditStatus.SUCCESS] || 0;
    const totalEvents = totalCountResult;
    const successRate = totalEvents > 0 ? parseFloat(((successCount / totalEvents) * 100).toFixed(2)) : 100;
    const criticalEventsCount = bySeverity[AuditSeverity.CRITICAL] || 0;
    const uniqueActorsCount = uniqueActorResult[0]?.count || 0;

    const summary: AuditSummary = {
      totalEvents,
      successRate,
      criticalEventsCount,
      uniqueActorsCount,
    };

    const timeSeries = timeSeriesStats.map((row) => ({
      timestamp: row._id,
      count: row.count,
    }));

    return {
      summary,
      byAction,
      byEntity,
      bySeverity,
      byStatus,
      timeSeries,
    };
  }

  /**
   * Exports audit log records matching filters to JSON or CSV formatted string.
   *
   * @param filters Filter criteria.
   * @param format Export format ('JSON' | 'CSV').
   */
  async export(filters: AuditFilters, format: 'JSON' | 'CSV'): Promise<string | Buffer> {
    const result = await this.find(filters, { page: 1, limit: 10000, sortBy: 'createdAt', sortOrder: 'DESC' });
    const records = result.items;

    if (format === 'CSV') {
      const headers = ['ID', 'Timestamp', 'Action', 'Entity', 'EntityID', 'ActorEmail', 'ActorRole', 'Severity', 'Status', 'Description'];
      const rows = records.map((r) => [
        r.id,
        r.timestamp instanceof Date ? r.timestamp.toISOString() : String(r.timestamp),
        r.action,
        r.entity,
        r.entityId || '',
        r.actor.email,
        r.actor.role,
        r.severity,
        r.status,
        `"${(r.description || '').replace(/"/g, '""')}"`,
      ]);

      const csvString = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      return csvString;
    }

    return JSON.stringify(records, null, 2);
  }

  /**
   * Deletes audit logs older than a specified cut-off date (or default retention window).
   *
   * @param olderThan Expiry cutoff timestamp.
   * @returns Number of purged records.
   */
  async cleanup(olderThan?: Date): Promise<number> {
    const cutoff = olderThan || new Date(Date.now() - DEFAULT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    return this.auditRepository.deleteOlderThan(cutoff);
  }
}
