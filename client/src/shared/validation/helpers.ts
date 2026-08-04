import { z } from 'zod';
import { VALIDATION_MESSAGES } from './messages';
import { formatFileSize, validateFileSize, validateFileType } from '../components/form/FileUpload/FileUpload.utils';

// Re-export file utility validation helpers to consolidate validation layer imports
export { formatFileSize, validateFileSize, validateFileType };

/**
 * Formats a validation message containing {0}, {1} placeholders with dynamic replacement values.
 */
export const formatValidationMessage = (message: string, ...values: (string | number)[]): string => {
  let formatted = message;
  values.forEach((val, idx) => {
    formatted = formatted.replace(`{${idx}}`, String(val));
  });
  return formatted;
};

/**
 * Creates a standard Zod required string schema with a trim filter and custom message fallback.
 */
export const createRequiredSchema = (customMessage?: string): z.ZodString => {
  return z.string().trim().min(1, { message: customMessage ?? VALIDATION_MESSAGES.required });
};

/**
 * Creates an optional Zod schema preprocessed to convert empty form input strings into undefined.
 */
export const createOptionalSchema = <T extends z.ZodTypeAny>(
  schema: T
): z.ZodEffects<z.ZodOptional<T>, T['_output'] | undefined, unknown> => {
  return z.preprocess((val) => (val === '' ? undefined : val), schema.optional());
};
