import {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from './constants';

/**
 * Reusable Validation Feedback Messages (Module 9 - Step 9.12).
 *
 * Centralizes messaging for standard UI forms and zod validations.
 */
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: {
    required: 'Email address is required',
    invalid: 'Please enter a valid email address',
  },
  password: {
    required: 'Password is required',
    min: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    max: `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`,
    weak: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  },
  name: {
    min: `Name must be at least ${MIN_NAME_LENGTH} characters`,
    max: `Name cannot exceed ${MAX_NAME_LENGTH} characters`,
  },
  description: {
    max: `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
  },
  phone: {
    invalid: 'Please enter a valid 10-digit phone number',
  },
  otp: {
    invalid: 'Please enter a valid 6-digit verification code',
  },
  url: 'Please enter a valid URL (e.g. https://example.com)',
  date: {
    invalid: 'Please enter a valid date',
  },
  file: {
    tooLarge: 'Selected file size exceeds the allowed limit',
    unsupportedType: 'File format is not supported',
  },
} as const;
export type ValidationMessages = typeof VALIDATION_MESSAGES;
