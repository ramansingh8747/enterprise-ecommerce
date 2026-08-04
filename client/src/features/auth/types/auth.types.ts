/**
 * Auth Feature Type Definitions (Module 7 - Step 7.1).
 *
 * User roles, permission unions, and authentication status states.
 */

export type UserRole = 'super_admin' | 'admin' | 'customer' | 'vendor' | 'guest';

export type AuthStatus =
  | 'idle'
  | 'authenticating'
  | 'authenticated'
  | 'unauthenticated'
  | 'expired';

export type AuthStep = 'login' | 'verify_otp' | 'mfa' | 'reset_password';
