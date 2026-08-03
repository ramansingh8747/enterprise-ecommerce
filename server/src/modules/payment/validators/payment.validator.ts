import { body, param, query } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';
import { PaymentMethod, PaymentProvider, PaymentStatus, PaymentType } from '../enums/payment.enums';
import { MAX_REFUND_AMOUNT } from '../constants/payment.constants';

/**
 * Enterprise Payment Gateway Express-Validator Chains (Module 27.5).
 *
 * Validates request payload structures, monetary amounts, enum values,
 * parameter IDs, and query filters before reaching controllers.
 */

const VALID_PROVIDERS = Object.values(PaymentProvider);
const VALID_METHODS = Object.values(PaymentMethod);
const VALID_STATUSES = Object.values(PaymentStatus);
const VALID_TYPES = Object.values(PaymentType);

/**
 * Validation chain for POST /api/v1/payments (Create Payment)
 */
export const createPaymentValidation = [
  body('orderId')
    .exists()
    .withMessage('orderId is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('orderId must be a non-empty string.'),

  body('amount')
    .exists()
    .withMessage('amount is required.')
    .isFloat({ min: 0.01, max: MAX_REFUND_AMOUNT })
    .withMessage(`amount must be a positive number up to ${MAX_REFUND_AMOUNT}.`)
    .toFloat(),

  body('paymentMethod')
    .exists()
    .withMessage('paymentMethod is required.')
    .isIn(VALID_METHODS)
    .withMessage(`paymentMethod must be one of: ${VALID_METHODS.join(', ')}.`),

  body('provider')
    .optional()
    .isIn(VALID_PROVIDERS)
    .withMessage(`provider must be one of: ${VALID_PROVIDERS.join(', ')}.`),

  body('paymentType')
    .optional()
    .isIn(VALID_TYPES)
    .withMessage(`paymentType must be one of: ${VALID_TYPES.join(', ')}.`),

  body('currency')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('currency must be a valid 3-letter ISO code.'),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/payments/capture (Capture Payment)
 */
export const capturePaymentValidation = [
  body('paymentId')
    .exists()
    .withMessage('paymentId is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('paymentId must be a non-empty string.'),

  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('amount must be a positive number.')
    .toFloat(),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/payments/refund (Refund Payment)
 */
export const refundPaymentValidation = [
  body('paymentId')
    .exists()
    .withMessage('paymentId is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('paymentId must be a non-empty string.'),

  body('amount')
    .exists()
    .withMessage('amount is required.')
    .isFloat({ min: 0.01, max: MAX_REFUND_AMOUNT })
    .withMessage(`amount must be a positive number up to ${MAX_REFUND_AMOUNT}.`)
    .toFloat(),

  body('reason')
    .optional()
    .isString()
    .trim()
    .withMessage('reason must be a string.'),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/payments/cancel (Cancel Payment)
 */
export const cancelPaymentValidation = [
  body('paymentId')
    .exists()
    .withMessage('paymentId is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('paymentId must be a non-empty string.'),

  body('reason')
    .optional()
    .isString()
    .trim()
    .withMessage('reason must be a string.'),

  validateRequest,
];

/**
 * Validation chain for GET /api/v1/payments (List Payments)
 */
export const getPaymentsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1.')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100.')
    .toInt(),

  query('provider')
    .optional()
    .isIn(VALID_PROVIDERS)
    .withMessage(`provider must be one of: ${VALID_PROVIDERS.join(', ')}.`),

  query('paymentMethod')
    .optional()
    .isIn(VALID_METHODS)
    .withMessage(`paymentMethod must be one of: ${VALID_METHODS.join(', ')}.`),

  query('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}.`),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 timestamp string.'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 timestamp string.'),

  validateRequest,
];

/**
 * Validation chain for ID param routes: GET /api/v1/payments/:id
 */
export const paymentIdParamValidation = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('id parameter is required.'),

  validateRequest,
];
