import { z } from 'zod';
import { VALIDATION_PATTERNS } from '@/shared/constants/validation.constants';

/**
 * Resend OTP Validation Schema (Module 7 - Step 7.2).
 */
export const resendOtpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .regex(VALIDATION_PATTERNS.EMAIL, 'Please enter a valid email address'),
});

export type ResendOtpFormData = z.infer<typeof resendOtpSchema>;
