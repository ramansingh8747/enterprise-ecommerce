import { EmailCategory } from '../types/email.types';
import { IEmailRequest } from './email-request.interface';
import { IEmailResponse } from './email-response.interface';

/**
 * Enterprise Email Provider Strategy Contract (Module 20.2 Strategy Pattern).
 * 
 * Contract that every vendor-specific provider (Nodemailer, SES, SendGrid, Mailgun, Mock)
 * must implement to plug into the core Email Service infrastructure.
 */
export interface IEmailProvider {
  /**
   * Vendor adapter name (e.g. 'MockEmailProvider', 'AmazonSesProvider').
   */
  readonly providerName: string;

  /**
   * Returns the provider identifier name.
   */
  getProviderName(): string;

  /**
   * Primary dispatch method executing email transmission.
   * @param request Universal, transport-independent email request object
   */
  send(request: IEmailRequest): Promise<IEmailResponse>;

  /**
   * Verifies connectivity to the underlying email server/API gateway.
   */
  verifyConnection(): Promise<boolean>;

  /**
   * Optional evaluation method to test if provider handles a given email category.
   * @param category Functional email category
   */
  supportsCategory?(category: EmailCategory): boolean;
}
