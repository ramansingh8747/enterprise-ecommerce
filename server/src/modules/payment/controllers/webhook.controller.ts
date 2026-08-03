import { Request, Response, NextFunction } from 'express';
import { WebhookService } from '../webhooks/webhook.service';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { DEFAULT_PAYMENT_CONFIG } from '../config/payment.config';

/**
 * Enterprise Payment Webhook Controller (Module 27.5).
 *
 * Public HTTP controller receiving incoming payment gateway webhook event payloads.
 * Delegates verification and processing strictly to WebhookService.
 */
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * POST /api/v1/payments/webhook or POST /api/v1/payments/webhook/:provider
   * Receives and processes gateway webhook event notifications.
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const providerStr =
        String(req.params.provider || req.body?.provider || req.headers['x-payment-provider'] || DEFAULT_PAYMENT_CONFIG.provider);

      const signature = String(
        req.headers['stripe-signature'] ||
        req.headers['x-razorpay-signature'] ||
        req.headers['x-signature'] ||
        req.body?.signature ||
        ''
      );

      const payload = req.body || {};

      const result = await this.webhookService.handleWebhook(providerStr, payload, signature);

      const response: ApiResponse<{
        eventId?: string;
        eventType?: string;
        acknowledged: boolean;
      }> = {
        success: result.success,
        message: result.message,
        data: {
          eventId: result.eventId,
          eventType: result.eventType,
          acknowledged: result.success,
        },
      };

      res.status(result.success ? 200 : 400).json(response);
    } catch (error) {
      next(error);
    }
  }
}
