import { z } from 'zod';
import { VALIDATION_PATTERNS } from '@/shared/constants/validation.constants';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

/**
 * Verify OTP Validation Schema (Module 7 - Step 7.2).
 */
export const verifyOtpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .regex(VALIDATION_PATTERNS.EMAIL, 'Please enter a valid email address'),
  otp: z
    .string()
    .min(1, 'Verification code is required')
    .length(
      AUTH_CONSTANTS.OTP_LENGTH,
      `Verification code must be exactly ${AUTH_CONSTANTS.OTP_LENGTH} digits`
    )
    .regex(/^\d+$/, 'Verification code must contain digits only'),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
