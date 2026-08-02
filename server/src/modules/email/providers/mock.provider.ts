import { IEmailProvider } from '../interfaces/email-provider.interface';
import { IEmailRequest } from '../interfaces/email-request.interface';
import { IEmailResponse } from '../interfaces/email-response.interface';
import { IEmailRecipient } from '../interfaces/email-recipient.interface';

/**
 * Enterprise Mock Email Provider Implementation (Module 20.2).
 * 
 * Simulates email delivery for development and automated testing without sending real network requests.
 * Transport-independent and dependency-injection friendly.
 */
export class MockEmailProvider implements IEmailProvider {
  readonly providerName = 'MockEmailProvider';

  /**
   * Returns provider identifier name.
   */
  getProviderName(): string {
    return this.providerName;
  }

  /**
   * Simulates active server connection verification.
   */
  async verifyConnection(): Promise<boolean> {
    return true;
  }

  /**
   * Normalizes recipient input formats into a clean array of email strings.
   */
  private normalizeRecipients(
    target?: IEmailRecipient | IEmailRecipient[] | string | string[]
  ): string[] {
    if (!target) {
      return [];
    }

    if (typeof target === 'string') {
      return [target];
    }

    if (Array.isArray(target)) {
      return target.map((item) => (typeof item === 'string' ? item : item.email));
    }

    return [target.email];
  }

  /**
   * Simulates email dispatch execution and logs diagnostic telemetry safely.
   */
  async send(request: IEmailRequest): Promise<IEmailResponse> {
    const acceptedRecipients = this.normalizeRecipients(request.to);
    const ccRecipients = this.normalizeRecipients(request.cc);
    const bccRecipients = this.normalizeRecipients(request.bcc);

    const messageId = `mock-msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    console.log(`[MockEmailProvider] Simulated email dispatch [ID: ${messageId}]:`);
    console.log(`  Subject: ${request.subject}`);
    console.log(`  To: ${acceptedRecipients.join(', ')}`);
    if (ccRecipients.length > 0) console.log(`  CC: ${ccRecipients.join(', ')}`);
    if (bccRecipients.length > 0) console.log(`  BCC: ${bccRecipients.join(', ')}`);
    console.log(`  Category: ${request.category}`);
    console.log(`  Priority: ${request.priority}`);
    console.log(`  Attachments: ${request.attachments?.length || 0} files`);

    return {
      success: true,
      messageId,
      provider: this.providerName,
      acceptedRecipients,
      rejectedRecipients: [],
      sentAt: new Date(),
      statusCode: 200,
    };
  }
}
