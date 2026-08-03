import { AuditFilters } from '../types/audit.types';

/**
 * Audit Export Request DTO (Module 24.5).
 *
 * Payload for requesting formatted audit log exports.
 */
export interface AuditExportDto {
  /** Output file format ('JSON' | 'CSV'). */
  format: 'JSON' | 'CSV';

  /** Filter criteria applied to exported records. */
  filters?: AuditFilters;

  /** Optional column selection list for CSV exports. */
  columns?: string[];

  /** Optional customized target filename. */
  filename?: string;
}
