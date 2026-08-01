import { ISmsProvider } from "../../interfaces/sms-provider.interface";

export class MockProvider implements ISmsProvider {

    async sendSms(
        mobile: string,
        message: string
    ): Promise<void> {

        console.log("====================================");
        console.log("📱 MOCK SMS PROVIDER");
        console.log(`Mobile : ${mobile}`);
        console.log(`Message: ${message}`);
        console.log("====================================");

    }

}