/**
 * Validation Rule Constants (Module 2 - Step 2.2).
 */

export const VALIDATION_PATTERNS = Object.freeze({
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  POSTAL_CODE: /^[A-Z0-9]{3,10}$/i,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
});

export const VALIDATION_LIMITS = Object.freeze({
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  TEXT_SHORT_MAX: 255,
  TEXT_LONG_MAX: 2000,
  FILE_MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
});
