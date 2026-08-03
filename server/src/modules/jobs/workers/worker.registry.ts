import { JobType } from '../enums/jobs.enums';
import { JobWorker } from './job.worker';

/**
 * Enterprise Worker Registry Engine (Module 25.4).
 *
 * Central registry managing worker handler bindings per JobType classification.
 * Prevents duplicate registrations and provides worker resolution for the execution engine.
 */
export class WorkerRegistry {
  private readonly registry = new Map<JobType, JobWorker>();

  /**
   * Registers a concrete worker handler for a specific JobType.
   * Throws an Error if a worker is already registered for the type.
   *
   * @param type Target JobType enum classification.
   * @param worker Concrete JobWorker instance.
   */
  registerWorker(type: JobType, worker: JobWorker): void {
    if (!type || !Object.values(JobType).includes(type)) {
      throw new Error(`Invalid or unsupported JobType for worker registration: ${type}`);
    }
    if (!worker || typeof worker.execute !== 'function') {
      throw new Error(`Invalid worker instance for JobType ${type}: must implement execute().`);
    }
    if (this.registry.has(type)) {
      const existing = this.registry.get(type);
      throw new Error(
        `Duplicate worker registration error: JobType '${type}' is already bound to worker '${existing?.name}'.`
      );
    }

    this.registry.set(type, worker);
  }

  /**
   * Unregisters a worker handler binding for a JobType.
   *
   * @param type Target JobType.
   * @returns True if unregistered, false if not found.
   */
  unregisterWorker(type: JobType): boolean {
    return this.registry.delete(type);
  }

  /**
   * Resolves the registered JobWorker handler bound to a JobType.
   *
   * @param type Target JobType.
   * @returns Registered JobWorker instance or undefined.
   */
  getWorker(type: JobType): JobWorker | undefined {
    return this.registry.get(type);
  }

  /**
   * Checks whether a worker handler is registered for a JobType.
   *
   * @param type Target JobType.
   * @returns True if registered.
   */
  hasWorker(type: JobType): boolean {
    return this.registry.has(type);
  }

  /**
   * Lists all registered worker bindings.
   *
   * @returns Array of registered job type and worker name descriptors.
   */
  listWorkers(): Array<{ type: JobType; workerName: string }> {
    const list: Array<{ type: JobType; workerName: string }> = [];
    for (const [type, worker] of this.registry.entries()) {
      list.push({ type, workerName: worker.name });
    }
    return list;
  }

  /**
   * Clears all registered workers (used for teardown and testing).
   */
  clear(): void {
    this.registry.clear();
  }
}

/** Global default WorkerRegistry singleton instance. */
export const globalWorkerRegistry = new WorkerRegistry();
