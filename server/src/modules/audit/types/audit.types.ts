import {
  AuditAction,
  AuditEntity,
  AuditSeverity,
  AuditStatus,
} from '../enums/audit.enums';
import {
  IAuditActor,
  IAuditChange,
  IAuditLog,
  IAuditMetadata,
} from '../interfaces/audit.interface';

/**
 * Enterprise Audit Logging Engine — Type Definitions (Module 24.1).
 *
 * Core domain types and payload shapes consumed across audit services,
 * providers, controllers, and repository abstractions.
 */

/**
 * Full domain record representation of an audit log entry.
 */
export type AuditRecord = IAuditLog;

/**
 * Input payload for recording a new audit event.
 * Timestamp and ID are generated automatically if omitted.
 */
export type AuditPayload = {
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  actor: IAuditActor;
  severity?: AuditSeverity;
  status?: AuditStatus;
  changes?: IAuditChange[];
  metadata?: IAuditMetadata;
  timestamp?: Date;
  description: string;
  failureReason?: string;
};

/**
 * Filtering criteria for querying audit logs.
 */
export type AuditFilters = {
  actorId?: string;
  action?: AuditAction | AuditAction[];
  entity?: AuditEntity | AuditEntity[];
  entityId?: string;
  severity?: AuditSeverity | AuditSeverity[];
  status?: AuditStatus | AuditStatus[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
  tags?: string[];
  requestId?: string;
  correlationId?: string;
};

/**
 * Pagination and sorting parameters for audit list queries.
 */
export type AuditPagination = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
};

/**
 * Search options structure combining filters and pagination parameters.
 */
export type AuditSearchOptions = {
  filters?: AuditFilters;
  pagination?: AuditPagination;
};

/**
 * High-level summary card metrics for audit event distribution.
 */
export type AuditSummary = {
  totalEvents: number;
  successRate: number;
  criticalEventsCount: number;
  uniqueActorsCount: number;
};

/**
 * Detailed statistical breakdown of audit log activity over a timeframe.
 */
export type AuditStatistics = {
  summary: AuditSummary;
  byAction: Record<string, number>;
  byEntity: Record<string, number>;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  timeSeries: Array<{
    timestamp: string;
    count: number;
  }>;
};
