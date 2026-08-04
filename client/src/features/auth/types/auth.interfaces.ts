import type { UserRole, AuthStatus } from './auth.types';

/**
 * Auth Feature Interface Contracts (Module 7 - Step 7.1).
 *
 * Strongly typed DTOs and state contracts for authentication.
 */

export interface ILoginRequest {
  readonly email: string;
  readonly password?: string;
}

export interface IVerifyOtpRequest {
  readonly email: string;
  readonly otp: string;
}

export interface IResendOtpRequest {
  readonly email: string;
}

export interface IRefreshTokenRequest {
  readonly refreshToken: string;
}

export interface IAuthUser {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly isEmailVerified: boolean;
  readonly avatarUrl?: string;
}

export interface IAuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}

export interface ISessionInfo {
  readonly deviceId: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly lastActiveAt: string;
}

export interface IAuthState {
  readonly user: IAuthUser | null;
  readonly tokens: IAuthTokens | null;
  readonly status: AuthStatus;
  readonly error: string | null;
}
