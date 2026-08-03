import { JobStatus } from '../enums/jobs.enums';

/**
 * Enterprise Job Lifecycle & State Transition Manager (Module 25.4).
 *
 * Enforces legal state machine transitions and calculates exponential retry backoffs
 * for background jobs.
 */
export class JobLifecycleManager {
  /**
   * Legal state transition map defining permitted next states for each JobStatus.
   */
  private static readonly LEGAL_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
    [JobStatus.PENDING]:   [JobStatus.QUEUED, JobStatus.CANCELLED, JobStatus.PAUSED],
    [JobStatus.QUEUED]:    [JobStatus.RUNNING, JobStatus.CANCELLED, JobStatus.PAUSED],
    [JobStatus.RUNNING]:   [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED],
    [JobStatus.FAILED]:    [JobStatus.RETRYING, JobStatus.CANCELLED],
    [JobStatus.RETRYING]:  [JobStatus.QUEUED, JobStatus.RUNNING, JobStatus.FAILED, JobStatus.CANCELLED],
    [JobStatus.PAUSED]:    [JobStatus.QUEUED, JobStatus.PENDING, JobStatus.CANCELLED],
    [JobStatus.COMPLETED]: [], // Terminal state
    [JobStatus.CANCELLED]: [], // Terminal state
  };

  /**
   * Validates whether a state transition from currentStatus to targetStatus is legal.
   *
   * @param currentStatus Current job status.
   * @param targetStatus Proposed new job status.
   * @returns True if transition is permitted.
   */
  static isTransitionAllowed(currentStatus: JobStatus, targetStatus: JobStatus): boolean {
    if (currentStatus === targetStatus) return true;
    const allowed = JobLifecycleManager.LEGAL_TRANSITIONS[currentStatus] || [];
    return allowed.includes(targetStatus);
  }

  /**
   * Asserts that a state transition is legal. Throws an Error if invalid.
   *
   * @param jobId Target job identifier string.
   * @param currentStatus Current job status.
   * @param targetStatus Proposed new job status.
   */
  static validateTransition(jobId: string, currentStatus: JobStatus, targetStatus: JobStatus): void {
    if (!JobLifecycleManager.isTransitionAllowed(currentStatus, targetStatus)) {
      throw new Error(
        `Illegal job state transition for job '${jobId}': Cannot transition from '${currentStatus}' to '${targetStatus}'.`
      );
    }
  }

  /**
   * Calculates exponential backoff retry delay in milliseconds.
   *
   * Formula: baseMs * (2 ^ (attempt - 1)) + randomJitter
   *
   * @param attempt Current attempt number (1-indexed).
   * @param baseMs Base initial delay in milliseconds (default: 1000 ms).
   * @param maxMs Maximum backoff cap in milliseconds (default: 300000 ms / 5 mins).
   * @returns Calculated backoff delay in milliseconds.
   */
  static calculateBackoffMs(attempt: number, baseMs: number = 1000, maxMs: number = 300000): number {
    const safeAttempt = Math.max(1, attempt);
    const exponential = baseMs * Math.pow(2, safeAttempt - 1);
    const jitter = Math.floor(Math.random() * 100); // 0-100ms jitter to prevent thundering herd
    const delay = exponential + jitter;

    return Math.min(delay, maxMs);
  }
}
