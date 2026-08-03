/**
 * Audit Cleanup Request DTO (Module 24.5).
 *
 * Payload for invoking manual or scheduled audit log retention purges.
 */
export interface AuditCleanupDto {
  /** Retention period in days (e.g. 90). */
  retentionDays?: number;

  /** Explicit cutoff date timestamp string (ISO 8601). */
  olderThan?: string;

  /** When true, calculates and returns matching count without deleting records. */
  dryRun?: boolean;
}
