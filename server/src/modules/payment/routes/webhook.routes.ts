import { Router, Request, Response, NextFunction } from 'express';
import { webhookController } from '../../../container';
import { webhookValidation } from '../validators/webhook.validator';

/**
 * Enterprise Webhook REST Router (Module 27.5).
 *
 * Public route wiring layer for incoming gateway webhook event notifications.
 * Does NOT require user authentication; relies on signature and provider validation.
 *
 * Mounted at: /api/v1/payments/webhook
 */
const webhookRouter = Router();

/**
 * POST /api/v1/payments/webhook
 * Public endpoint receiving gateway webhooks.
 */
webhookRouter.post(
  '/',
  ...webhookValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    webhookController.handleWebhook(req, res, next);
  }
);

/**
 * POST /api/v1/payments/webhook/:provider
 * Public endpoint receiving gateway webhooks with explicit provider path param.
 */
webhookRouter.post(
  '/:provider',
  ...webhookValidation,
  (req: Request, res: Response, next: NextFunction): void => {
    webhookController.handleWebhook(req, res, next);
  }
);

export default webhookRouter;
