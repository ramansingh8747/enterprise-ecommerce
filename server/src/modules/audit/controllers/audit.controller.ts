import { Request, Response, NextFunction } from 'express';
import { IAuditService } from '../interfaces/audit.interface';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { AuditFilters, AuditPagination, AuditRecord, AuditStatistics } from '../types/audit.types';
import { AuditAction, AuditEntity, AuditSeverity, AuditStatus } from '../enums/audit.enums';
import { DEFAULT_RETENTION_DAYS } from '../constants/audit.constants';

/**
 * Enterprise Audit Log Controller (Module 24.5).
 *
 * Thin HTTP adapter exposing Audit Log REST endpoints.
 * Responsibilities:
 * 1. Read validated request query/param/body parameters.
 * 2. Delegate execution strictly to IAuditService interface.
 * 3. Return standardized ApiResponse envelopes.
 * 4. Forward unhandled errors to Express next(error) middleware.
 *
 * Contains ZERO business logic.
 */
export class AuditController {
  constructor(private readonly auditService: IAuditService) {}

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
   * GET /api/v1/audit-logs
   * Retrieves paginated audit log entries matching filters.
   */
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
      const sortBy = this.qs(req, 'sortBy') || 'createdAt';
      const sortOrder = req.query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

      const pagination: AuditPagination = { page, limit, sortBy, sortOrder };

      const filters: AuditFilters = {
        actorId: this.qs(req, 'actorId'),
        action: this.qs(req, 'action') as AuditAction | undefined,
        entity: this.qs(req, 'entity') as AuditEntity | undefined,
        entityId: this.qs(req, 'entityId'),
        severity: this.qs(req, 'severity') as AuditSeverity | undefined,
        status: this.qs(req, 'status') as AuditStatus | undefined,
        startDate: this.qs(req, 'startDate') ? new Date(this.qs(req, 'startDate')!) : undefined,
        endDate: this.qs(req, 'endDate') ? new Date(this.qs(req, 'endDate')!) : undefined,
        search: this.qs(req, 'search'),
      };

      const result = await this.auditService.find(filters, pagination);

      const response: ApiResponse<{
        items: AuditRecord[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }> = {
        success: true,
        message: 'Audit logs retrieved successfully.',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/audit-logs/statistics
   * Returns analytical statistical breakdowns of audit log activity.
   */
  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: AuditFilters = {
        startDate: this.qs(req, 'startDate') ? new Date(this.qs(req, 'startDate')!) : undefined,
        endDate: this.qs(req, 'endDate') ? new Date(this.qs(req, 'endDate')!) : undefined,
        actorId: this.qs(req, 'actorId'),
        entity: this.qs(req, 'entity') as AuditEntity | undefined,
      };

      const stats: AuditStatistics = await this.auditService.statistics({ filters });

      const response: ApiResponse<AuditStatistics> = {
        success: true,
        message: 'Audit statistics computed successfully.',
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/audit-logs/:id
   * Retrieves a single audit log entry by ID.
   */
  async getAuditLogById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const auditLog = await this.auditService.findById(id);

      if (!auditLog) {
        res.status(404).json({
          success: false,
          message: 'Audit log entry not found.',
        });
        return;
      }

      const response: ApiResponse<AuditRecord> = {
        success: true,
        message: 'Audit log entry retrieved successfully.',
        data: auditLog,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/audit-logs/export
   * Prepares structured export payload (JSON or CSV string).
   */
  async exportAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format, filters = {} } = req.body;
      const exportContent = await this.auditService.export(filters, format);

      const response: ApiResponse<{ format: string; exportPayload: string | Buffer }> = {
        success: true,
        message: 'Audit log export prepared successfully.',
        data: {
          format,
          exportPayload: exportContent,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/audit-logs/cleanup
   * Purges old audit records beyond specified retention window.
   */
  async cleanupAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { retentionDays = DEFAULT_RETENTION_DAYS, olderThan, dryRun = false } = req.body;

      const cutoffDate = olderThan
        ? new Date(olderThan)
        : new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      if (dryRun) {
        const countResult = await this.auditService.find(
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
          message: 'Audit cleanup dry-run executed successfully.',
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

      const deletedCount = await this.auditService.cleanup(cutoffDate);

      const response: ApiResponse<{
        dryRun: boolean;
        retentionDays: number;
        cutoffDate: Date;
        deletedCount: number;
      }> = {
        success: true,
        message: 'Audit log cleanup completed successfully.',
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
