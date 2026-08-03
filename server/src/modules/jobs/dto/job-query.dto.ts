import { JobPriority, JobStatus, JobTrigger, JobType } from '../enums/jobs.enums';

/**
 * Job Query Request DTO (Module 25.5).
 *
 * Query parameters received for paginated job list retrieval.
 */
export interface JobQueryDto {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  type?: JobType;
  status?: JobStatus;
  priority?: JobPriority;
  trigger?: JobTrigger;
  queue?: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  tags?: string;
}
