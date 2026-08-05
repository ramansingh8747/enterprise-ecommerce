/**
 * Debounce Utility Function (Module 2 - Step 2.3).
 *
 * Wraps a function to delay its execution until delayMs milliseconds have elapsed since last invocation.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>): void {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      func.apply(this, args);
      timerId = null;
    }, delayMs);
  };
}
