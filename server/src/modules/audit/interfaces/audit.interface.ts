import {
  AuditAction,
  AuditEntity,
  AuditSeverity,
  AuditStatus,
} from '../enums/audit.enums';
import {
  AuditFilters,
  AuditPagination,
  AuditPayload,
  AuditRecord,
  AuditSearchOptions,
  AuditStatistics,
} from '../types/audit.types';

/**
 * Enterprise Audit Logging Engine — Domain Interfaces (Module 24.1).
 *
 * Fully typed, framework-agnostic interfaces establishing the contracts
 * for audit actors, metadata, delta changes, records, context, providers,
 * and application services.
 */

/**
 * Encapsulates identity details of the user or automated process executing an audited action.
 */
export interface IAuditActor {
  /** Unique ID of the actor (User ObjectId string or system ID). */
  userId: string;
  /** Primary email address of the actor. */
  email: string;
  /** System role assigned to the actor at execution time (e.g. ADMIN, USER, SYSTEM). */
  role: string;
  /** IP address from which the request originated. */
  ipAddress?: string;
  /** Client HTTP User-Agent header string. */
  userAgent?: string;
}

/**
 * Represents a single property-level delta change (before/after value pair).
 */
export interface IAuditChange {
  /** Property name or JSON path that was modified. */
  field: string;
  /** Value prior to modification (null/undefined if new creation). */
  oldValue: unknown;
  /** Value following modification (null/undefined if deleted). */
  newValue: unknown;
}

/**
 * Additional execution context and metadata associated with an audit log entry.
 */
export interface IAuditMetadata {
  /** Client IP address string. */
  ip?: string;
  /** Client HTTP User-Agent header string. */
  userAgent?: string;
  /** Unique HTTP request tracking ID. */
  requestId?: string;
  /** Distributed tracing correlation ID across services. */
  correlationId?: string;
  /** Request processing or operation duration in milliseconds. */
  durationMs?: number;
  /** Classification tags for filtering and categorization. */
  tags?: string[];
  /** Structured arbitrary key-value payload. */
  extra?: Record<string, unknown>;
}

/**
 * HTTP/Execution context extracted from incoming requests for audit building.
 */
export interface IAuditContext {
  /** Authenticated user actor details if present. */
  user?: IAuditActor;
  /** Client IP address. */
  ip: string;
  /** Client User-Agent string. */
  userAgent: string;
  /** Request ID header or generated UUID. */
  requestId: string;
  /** Correlation ID header or generated UUID. */
  correlationId: string;
}

/**
 * Core persistent Audit Log document model representation.
 */
export interface IAuditLog {
  /** Unique audit record identifier. */
  id: string;
  /** Type of action performed. */
  action: AuditAction;
  /** Domain entity subject to the action. */
  entity: AuditEntity;
  /** Primary key or unique identifier of the target entity instance. */
  entityId?: string;
  /** Identity details of the actor performing the action. */
  actor: IAuditActor;
  /** Severity level assigned to the audit event. */
  severity: AuditSeverity;
  /** Execution status result of the action. */
  status: AuditStatus;
  /** Array of field-level property delta changes recorded. */
  changes?: IAuditChange[];
  /** Supplementary context and tracing metadata. */
  metadata?: IAuditMetadata;
  /** Timestamp when the event occurred. */
  timestamp: Date;
  /** Human-readable description summarizing the audit event. */
  description: string;
  /** Detailed error message or stack excerpt if status is FAILURE. */
  failureReason?: string;
}

/**
 * Abstract Audit Provider contract for low-level log transport and ingestion engine.
 */
export interface IAuditProvider {
  /**
   * Dispatches a single audit payload to the target transport / persistence store.
   *
   * @param payload Audit log entry payload.
   */
  log(payload: AuditPayload): Promise<AuditRecord>;

  /**
   * Dispatches multiple audit payloads in a single bulk batch operation.
   *
   * @param payloads Array of audit log entry payloads.
   */
  logMany(payloads: AuditPayload[]): Promise<AuditRecord[]>;

  /**
   * Flushes any in-memory queued audit logs to the persistent target.
   */
  flush(): Promise<void>;

  /**
   * Gracefully shuts down the provider connection and releases resources.
   */
  shutdown(): Promise<void>;
}

/**
 * High-level Application Audit Service contract (Dependency Inversion Principle).
 */
export interface IAuditService {
  /**
   * Records a single audit event.
   *
   * @param payload Structurally validated audit payload.
   * @returns Created AuditRecord.
   */
  record(payload: AuditPayload): Promise<AuditRecord>;

  /**
   * Records multiple audit events in batch.
   *
   * @param payloads Array of audit payloads.
   * @returns Array of created AuditRecords.
   */
  recordMany(payloads: AuditPayload[]): Promise<AuditRecord[]>;

  /**
   * Queries audit logs using filters and pagination options.
   *
   * @param filters Criteria filters.
   * @param pagination Pagination and sorting options.
   * @returns Paginated result containing records and metadata.
   */
  find(
    filters: AuditFilters,
    pagination: AuditPagination
  ): Promise<{ items: AuditRecord[]; total: number; page: number; limit: number; totalPages: number }>;

  /**
   * Retrieves a single audit record by its unique identifier.
   *
   * @param id Unique audit record ID.
   * @returns AuditRecord or null if not found.
   */
  findById(id: string): Promise<AuditRecord | null>;

  /**
   * Aggregates statistical metrics on audit logs within a time range.
   *
   * @param options Search / filter options for aggregation.
   * @returns Summary statistics object.
   */
  statistics(options: AuditSearchOptions): Promise<AuditStatistics>;

  /**
   * Exports audit log records matching filters to a specified file format string.
   *
   * @param filters Filter criteria.
   * @param format Desired export format ('JSON' | 'CSV').
   * @returns Exported content buffer or string.
   */
  export(filters: AuditFilters, format: 'JSON' | 'CSV'): Promise<string | Buffer>;

  /**
   * Deletes audit logs older than a specified date boundary.
   *
   * @param olderThan Cut-off timestamp.
   * @returns Number of purged records.
   */
  cleanup(olderThan: Date): Promise<number>;
}
