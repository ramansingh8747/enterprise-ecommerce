import { z } from 'zod';
import { VALIDATION_PATTERNS, VALIDATION_LIMITS } from '@/shared/constants/validation.constants';

/**
 * Login Validation Schema (Module 7 - Step 7.2).
 */
export const loginSchema = z.object({
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
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
