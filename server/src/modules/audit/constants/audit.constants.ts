/**
 * Enterprise Audit Logging Engine — Production Constants (Module 24.1).
 *
 * Single source of truth for operational limits, defaults, retention policies,
 * and system actor constants used across audit services, providers, and models.
 * All constants are read-only to prevent runtime mutation.
 */

/** Maximum allowed payload size for custom metadata in bytes (16 KB). */
export const MAX_METADATA_SIZE = 16384 as const;

/** Maximum number of field-level delta changes tracked per audit record. */
export const MAX_CHANGES_TRACKED = 100 as const;

/** Default audit trail retention policy in days (90 days). */
export const DEFAULT_RETENTION_DAYS = 90 as const;

/** Default batch size for asynchronous bulk log flushing. */
export const AUDIT_BATCH_SIZE = 50 as const;

/** Default IANA timezone for audit record formatting. */
export const DEFAULT_TIMEZONE = 'UTC' as const;

/** Reserved system actor representation when an action is executed automatically. */
export const SYSTEM_USER = {
  id: '000000000000000000000000',
  email: 'system@internal.ecommerce',
  role: 'SYSTEM',
} as const;

/** Default page size for paginated audit log queries. */
export const AUDIT_DEFAULT_LIMIT = 20 as const;

/** Maximum page size for paginated audit log queries. */
export const AUDIT_MAX_LIMIT = 1000 as const;

/** Base path prefix for audit REST API endpoints. */
export const AUDIT_BASE_PATH = '/api/v1/audit-logs' as const;
