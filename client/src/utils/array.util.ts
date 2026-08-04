/**
 * Array Utility Functions (Module 2 - Step 2.3).
 *
 * Generic array manipulation utilities.
 */

/**
 * Splits an array into chunks of specified size.
 */
export function chunk<T>(arr: readonly T[], size: number): T[][] {
  if (!Array.isArray(arr) || size <= 0) return [];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Returns an array with duplicate primitive values removed.
 */
export function unique<T>(arr: readonly T[]): T[] {
  if (!Array.isArray(arr)) return [];
  return Array.from(new Set(arr));
}

/**
 * Returns an array with duplicates removed based on a key extraction function.
 */
export function uniqueBy<T, K>(arr: readonly T[], keyFn: (item: T) => K): T[] {
  if (!Array.isArray(arr)) return [];
  const seen = new Set<K>();
  const result: T[] = [];
  for (const item of arr) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

/**
 * Groups array items into a dictionary mapped by a key extraction function.
 */
export function groupBy<T, K extends string | number>(
  arr: readonly T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  if (!Array.isArray(arr)) return {} as Record<K, T[]>;
  return arr.reduce<Record<K, T[]>>((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key]!.push(item);
    return acc;
  }, {} as Record<K, T[]>);
}
