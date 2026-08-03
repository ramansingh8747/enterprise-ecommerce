import { RateLimitStrategy } from '../enums/rate-limit.enums';

/**
 * Enterprise Rate Limit Window Manager (Module 28.2).
 *
 * Handles window boundary calculations, fixed/sliding window alignments,
 * reset epoch math, and expiration scanning.
 */
export class WindowManager {
  /**
   * Calculates current window start and reset timestamp boundaries.
   *
   * @param windowMs Window duration in milliseconds.
   * @param strategy Rate limiting algorithm strategy.
   * @param now Current timestamp in milliseconds. Defaults to Date.now().
   */
  static calculateWindow(
    windowMs: number,
    strategy: RateLimitStrategy,
    now: number = Date.now()
  ): { startTimeMs: number; resetTimeMs: number } {
    const validWindow = Math.max(1000, windowMs);

    if (strategy === RateLimitStrategy.FIXED_WINDOW) {
      // Align to fixed floor window boundaries (e.g. 0-60s, 60s-120s)
      const startTimeMs = Math.floor(now / validWindow) * validWindow;
      const resetTimeMs = startTimeMs + validWindow;
      return { startTimeMs, resetTimeMs };
    }

    // Sliding Window: dynamic window starting from current timestamp
    const startTimeMs = now;
    const resetTimeMs = now + validWindow;
    return { startTimeMs, resetTimeMs };
  }

  /**
   * Evaluates whether a window reset time has passed.
   *
   * @param resetTimeMs Target reset timestamp in milliseconds.
   * @param now Current timestamp in milliseconds.
   */
  static isWindowExpired(resetTimeMs: number, now: number = Date.now()): boolean {
    return now >= resetTimeMs;
  }

  /**
   * Computes sliding window overlap weight ratio for sliding window calculations.
   *
   * @param windowStartMs Previous window start time in milliseconds.
   * @param windowMs Window duration in milliseconds.
   * @param now Current timestamp in milliseconds.
   */
  static calculateSlidingRatio(
    windowStartMs: number,
    windowMs: number,
    now: number = Date.now()
  ): number {
    const timePassedInWindow = now - windowStartMs;
    const ratio = (windowMs - timePassedInWindow) / windowMs;
    return Math.max(0, Math.min(1, ratio));
  }
}
