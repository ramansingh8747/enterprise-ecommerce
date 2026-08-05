/**
 * Throttle Utility Function (Module 2 - Step 2.3).
 *
 * Wraps a function to limit execution to at most once per limitMs milliseconds.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (this: unknown, ...args: Parameters<T>): void {
    const now = Date.now();
    if (now - lastCall >= limitMs) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}
