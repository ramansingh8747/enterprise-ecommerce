/**
 * Enterprise Formatter Helper Functions (Module 2 - Step 2.3).
 *
 * Formatting utilities for currency, percentage, file size, and phone numbers.
 */

/**
 * Formats a numeric amount into localized currency string.
 *
 * @param amount Number to format.
 * @param currency ISO 4217 Currency Code (default: 'USD').
 * @param locale Locale string (default: 'en-US').
 */
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  if (isNaN(amount)) return '$0.00';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Formats a decimal ratio or number into a percentage string.
 *
 * @param value Decimal ratio (e.g. 0.15 for 15%).
 * @param decimals Decimal places (default: 0).
 */
export function formatPercentage(value: number, decimals = 0): string {
  if (isNaN(value)) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats a raw byte count into human-readable file size (KB, MB, GB).
 *
 * @param bytes File size in bytes.
 */
export function formatFileSize(bytes: number): string {
  if (isNaN(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 2)} ${units[i] || 'B'}`;
}

/**
 * Formats a US/International phone number string.
 *
 * @param phone Raw phone string.
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}
