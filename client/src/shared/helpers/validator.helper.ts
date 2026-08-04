import { VALIDATION_PATTERNS } from '../constants/validation.constants';

/**
 * Enterprise Validation Helper Functions (Module 2 - Step 2.3).
 *
 * Pure validation predicates for emails, phone numbers, URLs, and empty values.
 */

/**
 * Validates whether a string is a valid email address.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_PATTERNS.EMAIL.test(email.trim());
}

/**
 * Validates whether a string is a valid E.164 / international phone number.
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  return VALIDATION_PATTERNS.PHONE.test(phone.trim());
}

/**
 * Validates whether a string is a valid HTTP/HTTPS URL.
 */
export function isValidUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks whether a value is null, undefined, empty string, empty array, or empty object.
 */
export function isEmptyValue(val: unknown): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') return val.trim().length === 0;
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === 'object') return Object.keys(val as object).length === 0;
  return false;
}
