/**
 * OTP service response contracts.
 */
export interface CreateOtpResponse {
    otp: number;
    expiresAt: Date;
}
