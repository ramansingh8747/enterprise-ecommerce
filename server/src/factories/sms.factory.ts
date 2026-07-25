import { ISmsProvider } from "../services/sms/sms.interface";
import { MockProvider } from "../providers/sms/mock.provider";
import { TwilioProvider } from "../providers/sms/twilio.provider";
import { Msg91Provider } from "../providers/sms/msg91.provider";

export class SmsFactory {

    static createProvider(): ISmsProvider {

        const provider = process.env.SMS_PROVIDER?.toLowerCase();
        //const provider = "mock";

        switch (provider) {

            case "mock":
                return new MockProvider();

            case "twilio":
                return new TwilioProvider();

            case "msg91":
                return new Msg91Provider();

            default:
                throw new Error(
                    `Unsupported SMS provider: ${provider}`
                );

        }

    }

}