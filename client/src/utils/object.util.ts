/**
 * Object Utility Functions (Module 2 - Step 2.3).
 *
 * Generic object manipulation, clone, pick, omit, and inspection utilities.
 */

/**
 * Predicate checking if a value is a non-null object.
 */
export function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/**
 * Creates an object composed of specified keys picked from target object.
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  if (!isObject(obj)) return {} as Pick<T, K>;
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Creates an object composed of target object's properties excluding specified keys.
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  if (!isObject(obj)) return {} as Omit<T, K>;
  const keysSet = new Set<keyof T>(keys);
  const result = {} as Omit<T, K>;
  for (const key of Object.keys(obj) as Array<keyof T>) {
    if (!keysSet.has(key)) {
      (result as any)[key] = obj[key];
    }
  }
  return result;
}

/**
 * Deeply clones a JSON-serializable object.
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  try {
    return JSON.parse(JSON.stringify(obj)) as T;
  } catch {
    return obj;
  }
}
