import { body, param } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';
import { PaymentProvider } from '../enums/payment.enums';

const VALID_PROVIDERS = Object.values(PaymentProvider);

/**
 * Express-Validator Chain for Webhook Endpoints (Module 27.5).
 */
export const webhookValidation = [
  param('provider')
    .optional()
    .isIn(VALID_PROVIDERS)
    .withMessage(`provider parameter must be one of: ${VALID_PROVIDERS.join(', ')}.`),

  body('provider')
    .optional()
    .isIn(VALID_PROVIDERS)
    .withMessage(`provider must be one of: ${VALID_PROVIDERS.join(', ')}.`),

  validateRequest,
];
