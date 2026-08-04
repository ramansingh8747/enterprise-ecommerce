/**
 * Validation Numeric Constants (Module 9 - Step 9.12).
 *
 * Avoids magic numbers in schemas and form fields.
 */
export const MIN_PASSWORD_LENGTH = 8 as const;
export const MAX_PASSWORD_LENGTH = 32 as const;
export const MIN_NAME_LENGTH = 2 as const;
export const MAX_NAME_LENGTH = 50 as const;
export const MAX_DESCRIPTION_LENGTH = 1000 as const;
export const PHONE_LENGTH = 10 as const;
export const OTP_LENGTH = 6 as const;
export const MAX_FILE_SIZE = 5242880 as const; // 5MB default
export const DEFAULT_MAX_FILES = 5 as const;
