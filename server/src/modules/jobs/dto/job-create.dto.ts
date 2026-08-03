import { JobPriority, JobTrigger, JobType } from '../enums/jobs.enums';
import { JobSchedule } from '../types/jobs.types';

/**
 * Job Create Request DTO (Module 25.5).
 *
 * Payload shape received when requesting new background job creation via REST API.
 */
export interface JobCreateDto {
  /** Optional human-readable task name. */
  name?: string;

  /** Required JobType classification enum. */
  type: JobType;

  /** Optional JobPriority level (defaults to NORMAL). */
  priority?: JobPriority;

  /** Optional JobTrigger origin (defaults to MANUAL or API). */
  trigger?: JobTrigger;

  /** Input data parameters dictionary passed to the worker handler. */
  payload: Record<string, unknown>;

  /** Optional metadata tags or correlation info. */
  metadata?: {
    createdBy?: string;
    source?: string;
    correlationId?: string;
    requestId?: string;
    tags?: string[];
  };

  /** Optional execution schedule definition for recurring or delayed tasks. */
  schedule?: JobSchedule;
}
