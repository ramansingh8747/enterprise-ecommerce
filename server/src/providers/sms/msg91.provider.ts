import { ISmsProvider } from "../../interfaces/sms-provider.interface";

export class Msg91Provider implements ISmsProvider {

    async sendSms(
        mobile: string,
        message: string
    ): Promise<void> {

        try {

            /**
             * TODO:
             * Integrate MSG91 API here.
             *
             * Example:
             * - Read AUTH KEY from environment
             * - Call MSG91 Send SMS API
             * - Handle success and failure responses
             */

            console.log("====================================");
            console.log("📨 MSG91 PROVIDER");
            console.log(`Mobile : ${mobile}`);
            console.log(`Message: ${message}`);
            console.log("====================================");

        } catch (error) {

            console.error("MSG91 SMS Error:", error);

            throw new Error("Failed to send SMS using MSG91.");

        }

    }

}