import { DEFAULT_JOB_CONFIG, IJobConfig } from '../config/jobs.config';

/**
 * Health status representation returned by the Scheduler Engine.
 */
export interface ISchedulerHealth {
  isRunning: boolean;
  isPaused: boolean;
  activeJobsCount: number;
  uptimeSeconds: number;
}

/**
 * Enterprise Scheduler Engine State Manager (Module 25.4).
 *
 * Manages the lifecycle state (start, stop, pause, resume, health check, shutdown)
 * of the background scheduling worker pool.
 */
export class SchedulerEngine {
  private isRunning = false;
  private isPaused = false;
  private startTime: number | null = null;
  private activeJobsCount = 0;

  constructor(private readonly config: IJobConfig = DEFAULT_JOB_CONFIG) {}

  /**
   * Initializes the scheduler engine.
   */
  initialize(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.activeJobsCount = 0;
  }

  /**
   * Starts the scheduling engine loop.
   */
  start(): void {
    if (!this.config.schedulerEnabled) {
      console.warn('[SchedulerEngine] Scheduler start requested but config.schedulerEnabled is false.');
      return;
    }
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
  }

  /**
   * Stops the scheduling engine loop.
   */
  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
  }

  /**
   * Pauses the scheduling engine from picking up new jobs.
   */
  pause(): void {
    if (this.isRunning) {
      this.isPaused = true;
    }
  }

  /**
   * Resumes the scheduling engine from paused state.
   */
  resume(): void {
    if (this.isRunning) {
      this.isPaused = false;
    }
  }

  /**
   * Increments active worker execution counter.
   */
  incrementActiveJobs(): void {
    this.activeJobsCount += 1;
  }

  /**
   * Decrements active worker execution counter.
   */
  decrementActiveJobs(): void {
    this.activeJobsCount = Math.max(0, this.activeJobsCount - 1);
  }

  /**
   * Returns current scheduler engine health metrics.
   */
  getHealthStatus(): ISchedulerHealth {
    const uptimeSeconds = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      activeJobsCount: this.activeJobsCount,
      uptimeSeconds,
    };
  }

  /**
   * Gracefully shuts down the scheduler engine.
   */
  async shutdown(): Promise<void> {
    this.stop();
  }
}
