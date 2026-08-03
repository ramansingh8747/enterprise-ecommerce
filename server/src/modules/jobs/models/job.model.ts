import mongoose, { Document, Model, Schema } from 'mongoose';
import {
  JobPriority,
  JobStatus,
  JobTrigger,
  JobType,
} from '../enums/jobs.enums';

/**
 * Job Metadata Subdocument Interface.
 */
export interface IJobMetadataSubdocument {
  createdBy?: string;
  source?: string;
  correlationId?: string;
  requestId?: string;
  tags?: string[];
}

/**
 * Job Schedule Subdocument Interface.
 */
export interface IJobScheduleSubdocument {
  runAt?: Date;
  cronExpression?: string;
  timezone?: string;
}

/**
 * Job Execution Details Subdocument Interface.
 */
export interface IJobExecutionSubdocument {
  attempts: number;
  maxAttempts: number;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  lastError?: string;
}

/**
 * Job Mongoose Document Interface.
 */
export interface IJobDocument extends Document {
  _id: mongoose.Types.ObjectId;
  jobId: string;
  name: string;
  type: JobType;
  status: JobStatus;
  priority: JobPriority;
  trigger: JobTrigger;
  queue: string;
  payload: Record<string, unknown>;
  metadata?: IJobMetadataSubdocument;
  schedule?: IJobScheduleSubdocument;
  execution: IJobExecutionSubdocument;
  progress: number;
  result?: Record<string, unknown>;
  locked: boolean;
  lockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/* ==========================================================================
   SUBDOCUMENT SCHEMAS
   ========================================================================== */

const JobMetadataSchema = new Schema<IJobMetadataSubdocument>(
  {
    createdBy: { type: String, trim: true },
    source: { type: String, trim: true, default: 'SYSTEM' },
    correlationId: { type: String, trim: true },
    requestId: { type: String, trim: true },
    tags: { type: [String], default: [] },
  },
  { _id: false }
);

const JobScheduleSchema = new Schema<IJobScheduleSubdocument>(
  {
    runAt: { type: Date, index: true },
    cronExpression: { type: String, trim: true },
    timezone: { type: String, trim: true, default: 'UTC' },
  },
  { _id: false }
);

const JobExecutionSchema = new Schema<IJobExecutionSubdocument>(
  {
    attempts: { type: Number, default: 0, min: 0 },
    maxAttempts: { type: Number, default: 3, min: 0 },
    startedAt: { type: Date },
    completedAt: { type: Date },
    duration: { type: Number, min: 0 },
    lastError: { type: String, trim: true },
  },
  { _id: false }
);

/* ==========================================================================
   MAIN JOB SCHEMA
   ========================================================================== */

export const JobSchema = new Schema<IJobDocument>(
  {
    jobId: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(JobType),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.PENDING,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(JobPriority),
      default: JobPriority.NORMAL,
      required: true,
      index: true,
    },
    trigger: {
      type: String,
      enum: Object.values(JobTrigger),
      default: JobTrigger.MANUAL,
      required: true,
      index: true,
    },
    queue: { type: String, default: 'default', required: true, trim: true, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    metadata: { type: JobMetadataSchema, default: {} },
    schedule: { type: JobScheduleSchema },
    execution: {
      type: JobExecutionSchema,
      default: () => ({ attempts: 0, maxAttempts: 3 }),
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    result: { type: Schema.Types.Mixed },
    locked: { type: Boolean, default: false },
    lockedAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'jobs',
  }
);

/* ==========================================================================
   INDEX STRATEGY DEFINITIONS
   ========================================================================== */

// 1. Single Field Indexes
JobSchema.index({ createdAt: -1 }, { name: 'idx_jobs_created_at_desc' });

// 2. Compound Indexes for Queue Worker & Scheduler Queries
JobSchema.index(
  { status: 1, priority: -1 },
  { name: 'idx_jobs_status_priority' }
);
JobSchema.index(
  { queue: 1, status: 1 },
  { name: 'idx_jobs_queue_status' }
);
JobSchema.index(
  { type: 1, status: 1 },
  { name: 'idx_jobs_type_status' }
);
JobSchema.index(
  { trigger: 1, createdAt: -1 },
  { name: 'idx_jobs_trigger_created_at' }
);
JobSchema.index(
  { 'schedule.runAt': 1, status: 1 },
  { name: 'idx_jobs_schedule_run_at_status' }
);

/**
 * Job Mongoose Model.
 */
export const JobModel: Model<IJobDocument> =
  mongoose.models.Job || mongoose.model<IJobDocument>('Job', JobSchema);

export default JobModel;
