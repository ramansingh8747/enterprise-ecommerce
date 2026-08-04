import { getCellValue } from './column.utils';

/**
 * Default generic comparator function supporting strings, numbers, booleans, and dates.
 *
 * @param a Left comparison item.
 * @param b Right comparison item.
 * @param accessor Accessor descriptor (key, path, or resolver function).
 */
export function defaultComparator<TData>(
  a: TData,
  b: TData,
  accessor: keyof TData | string | ((row: TData) => unknown) | undefined
): number {
  const aVal = getCellValue(a, accessor);
  const bVal = getCellValue(b, accessor);

  if (aVal === bVal) return 0;
  if (aVal === undefined || aVal === null) return 1;
  if (bVal === undefined || bVal === null) return -1;

  // 1. Numbers
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return aVal - bVal;
  }

  // 2. Booleans
  if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
    return aVal === bVal ? 0 : aVal ? 1 : -1;
  }

  // 3. Strings & Dates
  if (typeof aVal === 'string' && typeof bVal === 'string') {
    // Check if the value matches ISO Date patterns (YYYY-MM-DD or standard ISO strings)
    const isIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(aVal) || aVal.includes('T');
    if (isIsoDate) {
      const aTime = Date.parse(aVal);
      const bTime = Date.parse(bVal);
      if (!isNaN(aTime) && !isNaN(bTime)) {
        return aTime - bTime;
      }
    }

    // Standard string locale comparison
    return aVal.localeCompare(bVal);
  }

  // Fallback string conversion comparison
  return String(aVal).localeCompare(String(bVal));
}
