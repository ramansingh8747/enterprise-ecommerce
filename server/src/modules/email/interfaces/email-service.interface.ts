import { IEmailRequest } from './email-request.interface';
import { IEmailResponse } from './email-response.interface';
import { IEmailProvider } from './email-provider.interface';

/**
 * Enterprise Email Application Service Contract (Module 20.3 Application Boundary).
 * Provider-agnostic application business layer interface.
 */
export interface IEmailService {
  /**
   * Dispatches a single email request through the configured provider strategy.
   * @param request Transport-independent email request payload
   */
  sendEmail(request: IEmailRequest): Promise<IEmailResponse>;

  /**
   * Dispatches a batch of email requests.
   * @param requests Array of email request payloads
   */
  sendBulkEmails(requests: IEmailRequest[]): Promise<IEmailResponse[]>;

  /**
   * Verifies connectivity of the active underlying email provider.
   */
  verifyProviderConnection(): Promise<boolean>;

  /**
   * Returns the name of the currently active default email provider.
   */
  getProviderName(): string;

  /**
   * Dynamically registers an email provider adapter with the provider registry.
   * @param provider Instance implementing IEmailProvider
   */
  registerProvider(provider: IEmailProvider): void;

  /**
   * Resolves a registered provider by name or returns the default provider.
   * @param providerName Optional provider identifier
   */
  getProvider(providerName?: string): IEmailProvider | null;

  // Backward compatibility alias methods
  send(request: IEmailRequest): Promise<IEmailResponse>;
  sendBatch?(requests: IEmailRequest[]): Promise<IEmailResponse[]>;
}
