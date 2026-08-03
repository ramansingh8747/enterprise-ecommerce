/**
 * Enterprise Background Jobs Engine — Shared Enumerations (Module 25.1).
 *
 * Centralized domain enums representing job classifications, execution lifecycle statuses,
 * priority levels, and trigger origins across the enterprise platform.
 */

/**
 * Enumeration of all supported background job types and task categories.
 */
export enum JobType {
  EMAIL              = 'EMAIL',
  NOTIFICATION       = 'NOTIFICATION',
  EXPORT             = 'EXPORT',
  IMPORT             = 'IMPORT',
  CLEANUP            = 'CLEANUP',
  INVENTORY_SYNC     = 'INVENTORY_SYNC',
  INVENTORY_ALERT    = 'INVENTORY_ALERT',
  REPORT             = 'REPORT',
  AUDIT_CLEANUP      = 'AUDIT_CLEANUP',
  SESSION_CLEANUP    = 'SESSION_CLEANUP',
  CACHE_INVALIDATION = 'CACHE_INVALIDATION',
}

/**
 * Enumeration of execution lifecycle statuses for queued or executing jobs.
 */
export enum JobStatus {
  PENDING   = 'PENDING',
  QUEUED    = 'QUEUED',
  RUNNING   = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED    = 'FAILED',
  RETRYING  = 'RETRYING',
  CANCELLED = 'CANCELLED',
  PAUSED    = 'PAUSED',
}

/**
 * Enumeration of job execution priority levels.
 */
export enum JobPriority {
  LOW      = 'LOW',
  NORMAL   = 'NORMAL',
  HIGH     = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Enumeration of trigger mechanisms that initiate a job execution.
 */
export enum JobTrigger {
  MANUAL   = 'MANUAL',
  API      = 'API',
  SCHEDULE = 'SCHEDULE',
  SYSTEM   = 'SYSTEM',
  EVENT    = 'EVENT',
}
