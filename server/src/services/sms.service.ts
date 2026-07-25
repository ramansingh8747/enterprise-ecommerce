import { ISmsProvider } from "../interfaces/sms-provider.interface";

export class SmsService {

    constructor(
        private readonly smsProvider: ISmsProvider
    ) {}

    async sendOtp(
        mobile: string,
        otp: number
    ): Promise<void> {

        const message = `Your OTP is ${otp}. It is valid for 5 minutes.`;

        await this.smsProvider.sendSms(
            mobile,
            message
        );
    }
}