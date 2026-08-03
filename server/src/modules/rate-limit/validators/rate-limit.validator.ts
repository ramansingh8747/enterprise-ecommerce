import { body, query } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';
import { RateLimitScope } from '../enums/rate-limit.enums';

const VALID_SCOPES = Object.values(RateLimitScope);

/**
 * Enterprise Rate Limit Request Express-Validator Chains (Module 28.5).
 */

/**
 * Validation chain for GET /api/v1/rate-limit
 */
export const getRateLimitValidation = [
  query('identifier')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('identifier must be a non-empty string.'),

  query('scope')
    .optional()
    .isIn(VALID_SCOPES)
    .withMessage(`scope must be one of: ${VALID_SCOPES.join(', ')}.`),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/rate-limit/reset
 */
export const resetValidation = [
  body('identifier')
    .exists()
    .withMessage('identifier is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('identifier must be a non-empty string.'),

  body('scope')
    .optional()
    .isIn(VALID_SCOPES)
    .withMessage(`scope must be one of: ${VALID_SCOPES.join(', ')}.`),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/rate-limit/reset-many
 */
export const resetManyValidation = [
  body('identifiers')
    .exists()
    .withMessage('identifiers is required.')
    .isArray({ min: 1 })
    .withMessage('identifiers must be a non-empty array of strings.'),

  body('identifiers.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('each identifier in array must be a non-empty string.'),

  body('scope')
    .optional()
    .isIn(VALID_SCOPES)
    .withMessage(`scope must be one of: ${VALID_SCOPES.join(', ')}.`),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/rate-limit/whitelist
 */
export const whitelistValidation = [
  body('identifier')
    .exists()
    .withMessage('identifier is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('identifier must be a non-empty string.'),

  body('scope')
    .optional()
    .isIn(VALID_SCOPES)
    .withMessage(`scope must be one of: ${VALID_SCOPES.join(', ')}.`),

  validateRequest,
];

/**
 * Validation chain for DELETE /api/v1/rate-limit/whitelist
 */
export const removeWhitelistValidation = [
  body('identifier')
    .exists()
    .withMessage('identifier is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('identifier must be a non-empty string.'),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/rate-limit/blacklist
 */
export const blacklistValidation = [
  body('identifier')
    .exists()
    .withMessage('identifier is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('identifier must be a non-empty string.'),

  body('duration')
    .optional()
    .isInt({ min: 1000 })
    .withMessage('duration must be an integer millisecond count >= 1000.')
    .toInt(),

  body('scope')
    .optional()
    .isIn(VALID_SCOPES)
    .withMessage(`scope must be one of: ${VALID_SCOPES.join(', ')}.`),

  validateRequest,
];

/**
 * Validation chain for DELETE /api/v1/rate-limit/blacklist
 */
export const removeBlacklistValidation = [
  body('identifier')
    .exists()
    .withMessage('identifier is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('identifier must be a non-empty string.'),

  validateRequest,
];
