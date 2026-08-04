/**
 * Auth Form Enums & Value Constants (Module 7 - Step 7.3).
 *
 * Enums representing form types, active steps, and delivery channels.
 */

export enum AuthFormType {
  LOGIN = 'login',
  REGISTER = 'register',
  VERIFY_OTP = 'verify_otp',
  RESEND_OTP = 'resend_otp',
  FORGOT_PASSWORD = 'forgot_password',
  RESET_PASSWORD = 'reset_password',
}

export enum AuthFormStep {
  LOGIN = 'login',
  VERIFY_OTP = 'verify_otp',
  MFA = 'mfa',
  RESET_PASSWORD = 'reset_password',
}

export enum OtpDeliveryMethod {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
}
