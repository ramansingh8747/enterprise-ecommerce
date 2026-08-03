import { IPaymentService } from '../interfaces/payment.interfaces';
import { WebhookValidator } from './webhook.validator';
import { WebhookProcessor } from './webhook.processor';
import { DEFAULT_PAYMENT_CONFIG, IPaymentConfig } from '../config/payment.config';
import { PaymentProviderFactory } from '../providers/payment.factory';

/**
 * Enterprise Webhook Orchestration Service (Module 27.4).
 *
 * High-level orchestration service receiving raw webhook payloads, validating
 * signatures and providers, and delegating execution to the WebhookProcessor.
 */
export class WebhookService {
  private readonly processor: WebhookProcessor;

  constructor(
    private readonly paymentService: IPaymentService,
    private readonly providerFactory: PaymentProviderFactory = new PaymentProviderFactory(),
    private readonly config: IPaymentConfig = DEFAULT_PAYMENT_CONFIG
  ) {
    this.processor = new WebhookProcessor(paymentService);
  }

  /**
   * Orchestrates raw webhook payload handling and event processing.
   *
   * @param providerStr Provider identifier string (e.g. 'STRIPE', 'RAZORPAY', 'MOCK').
   * @param payload Raw JSON request payload body.
   * @param signature Gateway signature header string.
   */
  async handleWebhook(
    providerStr: string,
    payload: Record<string, unknown>,
    signature: string
  ): Promise<{ success: boolean; eventId?: string; eventType?: string; message: string }> {
    // 1. Validate provider
    const provider = WebhookValidator.validateProvider(providerStr);
    if (!provider) {
      return { success: false, message: `Invalid or unsupported payment provider: '${providerStr}'.` };
    }

    // 2. Validate structural payload
    if (!WebhookValidator.validatePayload(payload)) {
      return { success: false, message: 'Invalid or empty webhook payload body.' };
    }

    // 3. Resolve driver from factory & validate webhook signature
    let webhookEvent;
    try {
      const driver = this.providerFactory.getProvider(provider);
      webhookEvent = await driver.validateWebhook(payload, signature || '');
    } catch (err) {
      // Fallback signature validation via WebhookValidator
      const isValidSig = WebhookValidator.validateSignature(payload, signature, this.config.webhookSecret);
      if (!isValidSig) {
        return { success: false, message: 'Webhook signature validation failed.' };
      }

      webhookEvent = {
        eventId: String(payload.eventId || `evt_${Date.now()}`),
        eventType: String(payload.eventType || 'payment.updated'),
        provider,
        payload,
        receivedAt: new Date(),
      };
    }

    // 4. Delegate event execution to WebhookProcessor
    const result = await this.processor.processEvent(webhookEvent);

    return {
      success: result.success,
      eventId: webhookEvent.eventId,
      eventType: webhookEvent.eventType,
      message: result.message,
    };
  }
}
