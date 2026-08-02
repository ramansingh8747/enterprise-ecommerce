import { IEmailProvider } from '../interfaces/email-provider.interface';
import { IEmailRequest } from '../interfaces/email-request.interface';
import { IEmailResponse } from '../interfaces/email-response.interface';

export class NodemailerEmailProvider implements IEmailProvider {
  readonly providerName = 'NodemailerEmailProvider';

  getProviderName(): string {
    return this.providerName;
  }

  async send(_request: IEmailRequest): Promise<IEmailResponse> {
    throw new Error('NodemailerEmailProvider.send is an architecture contract placeholder.');
  }

  async verifyConnection(): Promise<boolean> {
    return true;
  }
}
