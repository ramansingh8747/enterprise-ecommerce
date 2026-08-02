import { IEmailService } from '../interfaces/email-service.interface';
import { IEmailProvider } from '../interfaces/email-provider.interface';
import { IEmailRequest } from '../interfaces/email-request.interface';
import { IEmailResponse } from '../interfaces/email-response.interface';
import { EmailCategory, EmailPriority } from '../types/email.types';
import { ATTACHMENT_LIMITS, DEFAULT_SENDER } from '../constants/email.constants';

/**
 * Enterprise Email Service Implementation (Module 20.3).
 * 
 * Provider-independent application business layer.
 * Responsibilities:
 * 1. Validate email request properties and recipient targets.
 * 2. Apply default sender defaults and attachment limits.
 * 3. Orchestrate delivery across registered IEmailProvider strategy adapters.
 * 4. Provide clean extensibility hooks for retries, queueing, and telemetry.
 * 5. Guarantee zero vendor-specific driver code leaks into application domain.
 */
export class EmailService implements IEmailService {
  private readonly providerRegistry = new Map<string, IEmailProvider>();

  constructor(private defaultProvider: IEmailProvider) {
    if (!defaultProvider) {
      throw new Error('EmailService requires a valid default IEmailProvider implementation');
    }
    this.registerProvider(defaultProvider);
  }

  /**
   * Registers a provider strategy instance in the service registry.
   */
  registerProvider(provider: IEmailProvider): void {
    if (!provider || !provider.getProviderName()) {
      throw new Error('Cannot register invalid email provider instance');
    }
    this.providerRegistry.set(provider.getProviderName(), provider);
  }

  /**
   * Resolves a registered provider by name or returns the active default provider.
   */
  getProvider(providerName?: string): IEmailProvider | null {
    if (!providerName) {
      return this.defaultProvider;
    }
    return this.providerRegistry.get(providerName) || null;
  }

  /**
   * Returns the name of the active default email provider.
   */
  getProviderName(): string {
    return this.defaultProvider.getProviderName();
  }

  /**
   * Verifies connectivity to the default underlying email provider.
   */
  async verifyProviderConnection(): Promise<boolean> {
    return this.defaultProvider.verifyConnection();
  }

  /**
   * Validates required email request fields prior to dispatch.
   */
  private validateRequest(request: IEmailRequest): void {
    if (!request) {
      throw new Error('Email request payload cannot be null or undefined');
    }

    if (!request.to) {
      throw new Error('Email request must specify at least one recipient in "to" field');
    }

    if (!request.subject || typeof request.subject !== 'string' || request.subject.trim().length === 0) {
      throw new Error('Email subject line is required');
    }

    if (!request.category || !Object.values(EmailCategory).includes(request.category)) {
      throw new Error(`Invalid or missing email category: ${request.category}`);
    }

    if (!request.priority || !Object.values(EmailPriority).includes(request.priority)) {
      throw new Error(`Invalid or missing email priority: ${request.priority}`);
    }

    if (!request.html && !request.text && !request.templateId) {
      throw new Error('Email request must specify either html body, text body, or templateId');
    }

    if (request.attachments && Array.isArray(request.attachments)) {
      if (request.attachments.length > ATTACHMENT_LIMITS.maxCount) {
        throw new Error(
          `Attachment count (${request.attachments.length}) exceeds maximum limit of ${ATTACHMENT_LIMITS.maxCount}`
        );
      }
    }
  }

  /**
   * Applies default values (e.g. sender info) and normalizes email request.
   */
  private normalizeRequest(request: IEmailRequest): IEmailRequest {
    return {
      ...request,
      from: request.from || DEFAULT_SENDER,
      category: request.category || EmailCategory.TRANSACTIONAL,
      priority: request.priority || EmailPriority.NORMAL,
      metadata: request.metadata || {},
    };
  }

  /**
   * Extensibility Hook: Logging Telemetry (placeholder for metrics/tracing).
   */
  private logTelemetry(action: string, request: IEmailRequest): void {
    // Extensibility hook: trace correlation ID or metrics increment
    void action;
    void request;
  }

  /**
   * Extensibility Hook: Queue dispatch placeholder for async background processing.
   */
  private async enqueueForDelivery(request: IEmailRequest): Promise<void> {
    // Extensibility hook for future RabbitMQ / BullMQ integration
    void request;
  }

  /**
   * Extensibility Hook: Retry policy wrapper placeholder.
   */
  private async executeWithRetry(
    operation: () => Promise<IEmailResponse>
  ): Promise<IEmailResponse> {
    // Extensibility hook for exponential backoff retries
    return operation();
  }

  /**
   * Dispatches a single email request through the configured provider strategy.
   */
  async sendEmail(request: IEmailRequest): Promise<IEmailResponse> {
    try {
      this.validateRequest(request);
      const normalized = this.normalizeRequest(request);

      this.logTelemetry('DISPATCH_START', normalized);

      const targetProviderName = (normalized.metadata?.provider as string) || undefined;
      const provider = this.getProvider(targetProviderName);

      if (!provider) {
        throw new Error(`Email provider '${targetProviderName || 'default'}' not found in registry`);
      }

      const response = await this.executeWithRetry(() => provider.send(normalized));
      this.logTelemetry('DISPATCH_SUCCESS', normalized);

      return response;
    } catch (error: any) {
      return {
        success: false,
        provider: this.getProviderName(),
        errorMessage: error.message || 'Unknown email dispatch failure',
        sentAt: new Date(),
        statusCode: 500,
      };
    }
  }

  /**
   * Dispatches a batch of email requests.
   */
  async sendBulkEmails(requests: IEmailRequest[]): Promise<IEmailResponse[]> {
    if (!Array.isArray(requests) || requests.length === 0) {
      return [];
    }

    const responses: IEmailResponse[] = [];
    for (const req of requests) {
      const res = await this.sendEmail(req);
      responses.push(res);
    }
    return responses;
  }

  /**
   * Alias method for sendEmail (backward compatibility).
   */
  async send(request: IEmailRequest): Promise<IEmailResponse> {
    return this.sendEmail(request);
  }

  /**
   * Alias method for sendBulkEmails (backward compatibility).
   */
  async sendBatch(requests: IEmailRequest[]): Promise<IEmailResponse[]> {
    return this.sendBulkEmails(requests);
  }
}
