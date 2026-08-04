import { z } from 'zod';
import { VALIDATION_PATTERNS, VALIDATION_LIMITS } from '@/shared/constants/validation.constants';

/**
 * Registration Validation Schema (Module 7 - Step 7.2).
 */
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(
        VALIDATION_LIMITS.NAME_MIN_LENGTH,
        `First name must be at least ${VALIDATION_LIMITS.NAME_MIN_LENGTH} characters`
      )
      .max(VALIDATION_LIMITS.NAME_MAX_LENGTH, 'First name is too long'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(
        VALIDATION_LIMITS.NAME_MIN_LENGTH,
        `Last name must be at least ${VALIDATION_LIMITS.NAME_MIN_LENGTH} characters`
      )
      .max(VALIDATION_LIMITS.NAME_MAX_LENGTH, 'Last name is too long'),
    email: z
      .string()
      .min(1, 'Email address is required')
      .regex(VALIDATION_PATTERNS.EMAIL, 'Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(
        VALIDATION_LIMITS.PASSWORD_MIN_LENGTH,
        `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN_LENGTH} characters`
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and conditions' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
