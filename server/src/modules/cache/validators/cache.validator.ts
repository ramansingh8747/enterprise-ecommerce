import { body, query } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';
import { MAX_TTL } from '../constants/cache.constants';

/**
 * Enterprise Caching System Express-Validator Chains (Module 26.5).
 *
 * Validates cache keys, namespace strings, TTL limits, payload presence,
 * invalidation targets, and warmup entries before reaching controllers.
 */

/**
 * Validation chain for GET /api/v1/cache (Get Cache Entry)
 */
export const getCacheValidation = [
  query('key')
    .exists()
    .withMessage('key query parameter is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('key must be a non-empty string.'),

  query('namespace')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('namespace must be a non-empty string.'),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/cache (Set Cache Entry)
 */
export const setCacheValidation = [
  body('key')
    .exists()
    .withMessage('key is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('key must be a non-empty string.'),

  body('value')
    .exists()
    .withMessage('value is required.'),

  body('ttl')
    .optional()
    .isInt({ min: 1, max: MAX_TTL })
    .withMessage(`ttl must be an integer between 1 and ${MAX_TTL} seconds.`)
    .toInt(),

  body('namespace')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('namespace must be a non-empty string.'),

  validateRequest,
];

/**
 * Validation chain for DELETE /api/v1/cache (Delete Cache Entry)
 */
export const deleteCacheValidation = [
  query('key')
    .exists()
    .withMessage('key query parameter is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('key must be a non-empty string.'),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/cache/invalidate (Invalidate Cache)
 */
export const invalidateCacheValidation = [
  body('keys')
    .optional()
    .isArray()
    .withMessage('keys must be an array of string cache keys.'),

  body('namespaces')
    .optional()
    .isArray()
    .withMessage('namespaces must be an array of namespace strings.'),

  body('entity')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('entity must be a non-empty string.'),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/cache/warmup (Warmup Cache)
 */
export const warmupCacheValidation = [
  body('entries')
    .exists()
    .withMessage('entries array is required.')
    .isArray({ min: 1 })
    .withMessage('entries must be a non-empty array of key-value objects.'),

  body('entries.*.key')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each warmup entry must have a valid key.'),

  body('entries.*.value')
    .exists()
    .withMessage('Each warmup entry must have a value.'),

  validateRequest,
];

/**
 * Validation chain for DELETE /api/v1/cache/clear (Clear Cache Store)
 */
export const clearCacheValidation = [
  body('namespace')
    .optional()
    .isString()
    .trim()
    .withMessage('namespace must be a string.'),

  query('namespace')
    .optional()
    .isString()
    .trim()
    .withMessage('namespace must be a string.'),

  validateRequest,
];
