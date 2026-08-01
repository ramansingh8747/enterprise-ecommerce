import twilio, { Twilio } from "twilio";
import { ISmsProvider } from "../../interfaces/sms-provider.interface";

export class TwilioProvider implements ISmsProvider {

    private readonly client: Twilio;

    constructor() {

        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID!,
            process.env.TWILIO_AUTH_TOKEN!
        );

    }

    async sendSms(
        mobile: string,
        message: string
    ): Promise<void> {

        try {

            await this.client.messages.create({

                body: message,

                from: process.env.TWILIO_PHONE_NUMBER!,

                to: mobile

            });

        } catch (error) {

            console.error("Twilio SMS Error:", error);

            throw new Error("Failed to send SMS using Twilio.");

        }

    }

}