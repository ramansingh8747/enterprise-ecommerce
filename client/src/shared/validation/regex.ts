/**
 * Reusable Regex Patterns (Module 9 - Step 9.12).
 *
 * Provides standardized patterns for text validation.
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Mobile: exactly 10 digits
export const MOBILE_REGEX = /^[0-9]{10}$/;

// Password: 1 uppercase, 1 lowercase, 1 digit, 1 special char, min 8 characters
export const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// URL: basic http/https validation
export const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

// Slug: alphanumeric lowercase words separated by hyphens
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Numeric: digits only
export const NUMERIC_REGEX = /^[0-9]+$/;

// Alphabetic: letters only (case-insensitive)
export const ALPHABETIC_REGEX = /^[a-zA-Z]+$/;

// Alphanumeric: letters and digits only (case-insensitive)
export const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;
