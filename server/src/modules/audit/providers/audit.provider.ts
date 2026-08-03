import { IAuditProvider } from '../interfaces/audit.interface';
import { IAuditRepository } from '../repositories/audit.repository';
import { AuditPayload, AuditRecord } from '../types/audit.types';
import { IAuditLogDocument } from '../models/audit.model';

/**
 * Enterprise Audit Provider (Module 24.3).
 *
 * Implements IAuditProvider transport interface by delegating persistence operations
 * to the underlying IAuditRepository.
 */
export class AuditProvider implements IAuditProvider {
  constructor(private readonly auditRepository: IAuditRepository) {}

  /**
   * Helper mapping Mongoose Document to clean domain AuditRecord object.
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
      changes: doc.changes ? doc.changes.map((c) => ({ field: c.field, oldValue: c.before, newValue: c.after })) : [],
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

  /**
   * Dispatches a single audit payload to the repository store.
   *
   * @param payload Audit event payload.
   */
  async log(payload: AuditPayload): Promise<AuditRecord> {
    const created = await this.auditRepository.create(payload);
    return this.mapDocumentToRecord(created);
  }

  /**
   * Dispatches multiple audit payloads in bulk batch mode.
   *
   * @param payloads Array of audit event payloads.
   */
  async logMany(payloads: AuditPayload[]): Promise<AuditRecord[]> {
    if (!payloads || payloads.length === 0) return [];
    const createdList = await this.auditRepository.createMany(payloads);
    return createdList.map((doc) => this.mapDocumentToRecord(doc));
  }

  /**
   * Flushes queued in-memory logs to the target store.
   */
  async flush(): Promise<void> {
    // In-memory buffer flush hook
  }

  /**
   * Gracefully shuts down provider connections.
   */
  async shutdown(): Promise<void> {
    // Provider teardown hook
  }
}
