import { JobPriority, JobTrigger, JobType } from '../enums/jobs.enums';
import { IJobContext } from '../interfaces/jobs.interfaces';
import { DEFAULT_QUEUE_NAME } from '../constants/jobs.constants';

/**
 * Enterprise Job Context Utility (Module 25.1).
 *
 * Pure utility class responsible for generating job IDs, building execution context
 * objects, resolving triggers/priorities, and constructing metadata structures.
 */
export class JobContextUtil {
  /**
   * Generates a unique, prefixed job identifier string.
   *
   * @param type Job type classification.
   * @returns Formatted job ID string.
   */
  static generateJobId(type: JobType): string {
    const prefix = String(type).toLowerCase().replace(/_/g, '-');
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');

    return `job-${prefix}-${stamp}-${random}`;
  }

  /**
   * Resolves a raw trigger string to a valid JobTrigger enum value.
   *
   * @param rawTrigger Optional input trigger string.
   * @returns Resolved JobTrigger (defaults to MANUAL).
   */
  static resolveTrigger(rawTrigger?: string): JobTrigger {
    if (!rawTrigger) return JobTrigger.MANUAL;
    const upper = String(rawTrigger).trim().toUpperCase();
    if (Object.values(JobTrigger).includes(upper as JobTrigger)) {
      return upper as JobTrigger;
    }
    return JobTrigger.MANUAL;
  }

  /**
   * Resolves a raw priority string to a valid JobPriority enum value.
   *
   * @param rawPriority Optional input priority string.
   * @returns Resolved JobPriority (defaults to NORMAL).
   */
  static resolvePriority(rawPriority?: string): JobPriority {
    if (!rawPriority) return JobPriority.NORMAL;
    const upper = String(rawPriority).trim().toUpperCase();
    if (Object.values(JobPriority).includes(upper as JobPriority)) {
      return upper as JobPriority;
    }
    return JobPriority.NORMAL;
  }

  /**
   * Builds a standardized IJobContext object.
   *
   * @param queueName Target queue name.
   * @param trigger Trigger mechanism.
   * @param requestId Request tracking ID.
   * @param correlationId Distributed correlation ID.
   * @param initiatedBy User ID of actor.
   */
  static buildContext(
    queueName: string = DEFAULT_QUEUE_NAME,
    trigger: JobTrigger = JobTrigger.MANUAL,
    requestId?: string,
    correlationId?: string,
    initiatedBy?: string
  ): IJobContext {
    return {
      contextId: `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      queueName,
      trigger,
      requestId,
      correlationId,
      initiatedBy,
    };
  }

  /**
   * Constructs a sanitized metadata dictionary for background jobs.
   *
   * @param options Input metadata key-value parameters.
   */
  static buildMetadata(options?: Record<string, unknown>): Record<string, unknown> {
    if (!options) return {};
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== null) {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
