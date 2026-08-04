import { z } from 'zod';
import { EMAIL_REGEX, MOBILE_REGEX, PASSWORD_STRENGTH_REGEX, URL_REGEX } from './regex';
import { VALIDATION_MESSAGES } from './messages';
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from './constants';
import { createRequiredSchema, createOptionalSchema } from './helpers';

/**
 * Shared Base Zod Validation Schemas (Module 9 - Step 9.12).
 *
 * Provides central validations for credentials, profile info, URLs, files, etc.
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: VALIDATION_MESSAGES.email.required })
  .regex(EMAIL_REGEX, { message: VALIDATION_MESSAGES.email.invalid });

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, { message: VALIDATION_MESSAGES.password.min })
  .max(MAX_PASSWORD_LENGTH, { message: VALIDATION_MESSAGES.password.max })
  .regex(PASSWORD_STRENGTH_REGEX, { message: VALIDATION_MESSAGES.password.weak });

export const phoneSchema = z
  .string()
  .trim()
  .regex(MOBILE_REGEX, { message: VALIDATION_MESSAGES.phone.invalid });

export const requiredStringSchema = createRequiredSchema();

export const optionalStringSchema = createOptionalSchema(z.string());

export const urlSchema = z
  .string()
  .trim()
  .regex(URL_REGEX, { message: VALIDATION_MESSAGES.url });

export const fileSchema = z.instanceof(File).or(
  z.object({
    url: z.string().url({ message: VALIDATION_MESSAGES.url }),
    name: z.string().optional(),
  })
);
