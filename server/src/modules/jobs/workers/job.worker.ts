import { IJobContext } from '../interfaces/jobs.interfaces';

/**
 * Abstract Base Background Job Worker (Module 25.4).
 *
 * Generic base class for custom task execution workers. Concrete job handlers extend this
 * class and implement the abstract execute() method along with optional lifecycle hooks.
 *
 * @template TPayload Shape of job input payload parameters.
 * @template TResult Shape of job output execution result.
 */
export abstract class JobWorker<
  TPayload = Record<string, unknown>,
  TResult = Record<string, unknown>
> {
  /**
   * Human-readable worker identifier name.
   */
  abstract readonly name: string;

  /**
   * Primary execution task logic implemented by concrete workers.
   *
   * @param payload Input task parameters.
   * @param context Execution context details.
   * @returns Produced result object.
   */
  abstract execute(payload: TPayload, context: IJobContext): Promise<TResult>;

  /**
   * Optional lifecycle hook executed immediately prior to task execution.
   */
  async beforeExecute?(_jobId: string, _payload: TPayload, _context: IJobContext): Promise<void> {
    // Default no-op lifecycle hook
  }

  /**
   * Optional lifecycle hook executed immediately following task execution.
   */
  async afterExecute?(_jobId: string, _result: TResult, _context: IJobContext): Promise<void> {
    // Default no-op lifecycle hook
  }

  /**
   * Optional lifecycle hook executed when task completes successfully.
   */
  async onSuccess?(_jobId: string, _result: TResult, _context: IJobContext): Promise<void> {
    // Default no-op lifecycle hook
  }

  /**
   * Optional lifecycle hook executed when task execution fails with an Error.
   */
  async onFailure?(_jobId: string, _error: Error, _context: IJobContext): Promise<void> {
    // Default no-op lifecycle hook
  }

  /**
   * Optional lifecycle hook executed when a failed task is scheduled for retry.
   */
  async onRetry?(_jobId: string, _attempt: number, _error: Error, _context: IJobContext): Promise<void> {
    // Default no-op lifecycle hook
  }
}
