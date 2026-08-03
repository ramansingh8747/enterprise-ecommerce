/**
 * Enterprise Background Jobs Engine — Module Barrel Export (Module 25.1 – 25.5).
 *
 * Re-exports all public module members following clean architecture standards.
 * Allows consumers to import from the module root:
 *   import { JobsController, JobService, SchedulerService, JobWorker, WorkerRegistry } from '../modules/jobs';
 */

// Enums
export * from './enums/jobs.enums';

// Constants
export * from './constants/jobs.constants';

// Config
export * from './config/jobs.config';

// Interfaces
export * from './interfaces/jobs.interfaces';

// Types
export * from './types/jobs.types';

// DTOs
export * from './dto/job-create.dto';
export * from './dto/job-query.dto';
export * from './dto/job-retry.dto';
export * from './dto/job-cancel.dto';

// Models
export * from './models/job.model';

// Repositories
export * from './repositories/jobs.repository';
export * from './repositories/mongo-jobs.repository';

// Providers
export * from './providers/jobs.provider';

// Services
export * from './services/jobs.service';

// Controllers
export * from './controllers/jobs.controller';

// Validators
export * from './validators/jobs.validator';

// Scheduler
export * from './scheduler/scheduler.engine';
export * from './scheduler/scheduler.service';

// Workers
export * from './workers/job.worker';
export * from './workers/worker.registry';

// Executors
export * from './executors/job.executor';

// Lifecycle
export * from './lifecycle/job.lifecycle';

// Utils
export * from './utils/job-context.util';

// Router (default export — matches pattern of other module barrels)
export { default as jobsRoutes } from './routes/jobs.routes';
