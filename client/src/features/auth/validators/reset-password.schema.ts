import { z } from 'zod';
import { VALIDATION_LIMITS } from '@/shared/constants/validation.constants';

/**
 * Reset Password Validation Schema (Module 7 - Step 7.2).
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'New password is required')
      .min(
        VALIDATION_LIMITS.PASSWORD_MIN_LENGTH,
        `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN_LENGTH} characters`
      ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
