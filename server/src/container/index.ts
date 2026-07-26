import { SmsFactory } from "../factories/sms.factory";
import { SmsService } from "../services/sms.service";
import { OtpService } from "../services/otp.service";
import { JwtService } from "../services/jwt.service";
import { AuthService } from "../services/auth.service";

const smsProvider = SmsFactory.createProvider();

export const smsService = new SmsService(smsProvider);
export const jwtService = new JwtService();              // 🆕 pehle move kiya
export const authService = new AuthService(jwtService);   // ab jwtService already ready hai

export const otpService = new OtpService(smsService);
