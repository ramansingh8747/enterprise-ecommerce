import {
  AuditAction,
  AuditEntity,
  AuditSeverity,
  AuditStatus,
} from '../enums/audit.enums';

/**
 * Audit Query Request DTO (Module 24.5).
 *
 * Represents the client-facing HTTP query string parameter shape received by
 * the Express controller before transformation into domain AuditFilters and AuditPagination.
 */
export interface AuditQueryDto {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  actorId?: string;
  action?: AuditAction;
  entity?: AuditEntity;
  entityId?: string;
  severity?: AuditSeverity;
  status?: AuditStatus;
  success?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  tags?: string;
  requestId?: string;
  correlationId?: string;
}
