/**
 * Date Utility Functions (Module 2 - Step 2.3).
 *
 * Pure date formatting, comparison, and expiration utilities.
 */

/**
 * Formats a Date input into a localized date string.
 *
 * @param date Target Date object, ISO string, or timestamp.
 * @param locale Locale string (default: 'en-US').
 */
export function formatDate(date: string | number | Date, locale = 'en-US'): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/**
 * Checks whether a target date/timestamp has passed current time.
 *
 * @param expiryDate Target expiration date.
 */
export function isExpired(expiryDate: string | number | Date): boolean {
  if (!expiryDate) return true;
  const d = new Date(expiryDate);
  if (isNaN(d.getTime())) return true;
  return d.getTime() <= Date.now();
}

/**
 * Calculates absolute day difference between two dates.
 */
export function diffInDays(startDate: string | Date, endDate: string | Date): number {
  const s = new Date(startDate).getTime();
  const e = new Date(endDate).getTime();
  if (isNaN(s) || isNaN(e)) return 0;
  const diffMs = Math.abs(e - s);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
