/**
 * Auth Feature Constants (Module 7 - Step 7.1).
 *
 * Storage keys, OTP expiration intervals, and route definitions.
 */

export const AUTH_STORAGE_KEYS = Object.freeze({
  ACCESS_TOKEN: 'app_access_token',
  REFRESH_TOKEN: 'app_refresh_token',
  USER_DATA: 'app_user_data',
});

export const AUTH_CONSTANTS = Object.freeze({
  OTP_LENGTH: 6,
  OTP_RESEND_COOLDOWN_SECONDS: 60,
  PASSWORD_MIN_LENGTH: 8,
});
