import type { LoginFormData } from '../validators/login.schema';
import type { RegisterFormData } from '../validators/register.schema';
import type { VerifyOtpFormData } from '../validators/verify-otp.schema';
import type { ResendOtpFormData } from '../validators/resend-otp.schema';
import type { ForgotPasswordFormData } from '../validators/forgot-password.schema';
import type { ResetPasswordFormData } from '../validators/reset-password.schema';

/**
 * Auth Form Values Type Definitions (Module 7 - Step 7.3).
 *
 * Strongly typed form value aliases mapped directly from validated Zod schemas.
 */

export type LoginFormValues = LoginFormData;
export type RegisterFormValues = RegisterFormData;
export type VerifyOtpFormValues = VerifyOtpFormData;
export type ResendOtpFormValues = ResendOtpFormData;
export type ForgotPasswordFormValues = ForgotPasswordFormData;
export type ResetPasswordFormValues = ResetPasswordFormData;
