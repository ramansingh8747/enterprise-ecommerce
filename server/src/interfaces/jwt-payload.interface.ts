/**
 * JWT access/refresh token payload.
 *
 * `id` is the canonical user identifier used by auth middleware and services.
 * `userId` is an optional alias kept for backward-compatible helpers.
 */
export interface JwtPayload {
    id: string;
    mobile: string;
    role: string;
    userId?: string;
}
