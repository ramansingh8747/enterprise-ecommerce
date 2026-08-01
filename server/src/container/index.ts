import { SmsFactory } from "../factories/sms.factory";
import { SmsService } from "../services/sms.service";
import { OtpService } from "../services/otp.service";
import { JwtService } from "../services/jwt.service";
import { AuthService } from "../services/auth.service";
import { SessionService } from "../services/session.service";




const smsProvider = SmsFactory.createProvider();

export const smsService = new SmsService(smsProvider);
export const sessionService = new SessionService();

export const jwtService = new JwtService();

console.log("JWT Service Instance:", jwtService);

console.log(
    "verifyAccessToken:",
    typeof jwtService.verifyAccessToken
);

export const sessionService = new SessionService();

export const authService = new AuthService(
    jwtService,
    sessionService
);

export const otpService = new OtpService(smsService);