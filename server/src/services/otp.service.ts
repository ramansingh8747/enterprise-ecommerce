import crypto from "crypto";

import Otp from "../models/otp/otp.model";

import { CreateOtpResponse } from "../interfaces/otp-response.interface";
import { MAX_OTP_ATTEMPTS } from "../constants/otp.constants";

import {
    OTP_MIN,
    OTP_MAX,
    OTP_EXPIRY_MINUTES,
} from "../constants/otp.constants";

import { SmsService } from "./sms.service";

export class OtpService {

    constructor(
        private readonly smsService: SmsService
    ) { }

    private generateOtp(): number {

        return crypto.randomInt(OTP_MIN, OTP_MAX);

    }

    async createOtp(


        mobile: string
    ): Promise<CreateOtpResponse> {

        await Otp.findOneAndDelete({ mobile });

        const otp = this.generateOtp();

        const expiresAt = new Date();

        expiresAt.setMinutes(
            expiresAt.getMinutes() + OTP_EXPIRY_MINUTES
        );

        const otpDocument = await Otp.create({
            mobile,
            otp,
            expiresAt,
        });

        console.log("Saved OTP:", otpDocument);

        // Send OTP SMS
        await this.smsService.sendOtp(
            mobile,
            otp
        );

        return {
            otp,
            expiresAt,
        };

    }


    async verifyOtp(mobile: string, otp: number) {

        console.log("Verify Mobile:", mobile);

        const otpRecord = await Otp.findOne({ mobile });

        console.log("OTP Record:", otpRecord);

        if (!otpRecord) {
            throw new Error("OTP not found.");
        }

        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
            throw new Error("Maximum OTP attempts exceeded.");
        }

        if (otpRecord.expiresAt < new Date()) {
            throw new Error("OTP has expired.");
        }

       if (Number(otpRecord.otp) !== Number(otp)) {

            otpRecord.attempts += 1;

            await otpRecord.save();

            if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
                throw new Error("Maximum OTP attempts exceeded.");
            }

            throw new Error("Invalid OTP.");
        }

        await Otp.deleteOne({ _id: otpRecord._id });

        return otpRecord;
    }
}