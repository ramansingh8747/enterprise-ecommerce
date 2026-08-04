import { z } from 'zod';
import { VALIDATION_PATTERNS } from '@/shared/constants/validation.constants';

/**
 * Forgot Password Validation Schema (Module 7 - Step 7.2).
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .regex(VALIDATION_PATTERNS.EMAIL, 'Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
