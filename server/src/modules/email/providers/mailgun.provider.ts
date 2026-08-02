import { IEmailProvider } from '../interfaces/email-provider.interface';
import { IEmailRequest } from '../interfaces/email-request.interface';
import { IEmailResponse } from '../interfaces/email-response.interface';

export class MailgunEmailProvider implements IEmailProvider {
  readonly providerName = 'MailgunEmailProvider';

  getProviderName(): string {
    return this.providerName;
  }

  async send(_request: IEmailRequest): Promise<IEmailResponse> {
    throw new Error('MailgunEmailProvider.send is an architecture contract placeholder.');
  }

  async verifyConnection(): Promise<boolean> {
    return true;
  }
}
