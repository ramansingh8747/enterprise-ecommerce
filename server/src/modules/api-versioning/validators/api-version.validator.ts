import { body, query } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';
import { ApiVersion, CompatibilityMode, VersionResolutionStrategy } from '../enums/api-version.enums';

const VALID_VERSIONS = Object.values(ApiVersion);
const VALID_MODES = Object.values(CompatibilityMode);
const VALID_STRATEGIES = Object.values(VersionResolutionStrategy);
const VALID_ACTIONS = ['ENABLE', 'DISABLE', 'DEPRECATE'];

/**
 * Enterprise API Versioning Express-Validator Chains (Module 29.5).
 */

/**
 * Validation chain for GET /api/v1/api-versions
 */
export const getVersionsValidation = [
  query('version')
    .optional()
    .isIn(VALID_VERSIONS)
    .withMessage(`version must be one of: ${VALID_VERSIONS.join(', ')}.`),

  query('strategy')
    .optional()
    .isIn(VALID_STRATEGIES)
    .withMessage(`strategy must be one of: ${VALID_STRATEGIES.join(', ')}.`),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/api-versions/validate
 */
export const validateVersionValidation = [
  body('version')
    .exists()
    .withMessage('version is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('version must be a non-empty string.'),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/api-versions/compatibility
 */
export const compatibilityValidation = [
  body('sourceVersion')
    .exists()
    .withMessage('sourceVersion is required.')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('sourceVersion must be a non-empty string.'),

  body('targetVersion')
    .optional()
    .isString()
    .trim()
    .withMessage('targetVersion must be a string.'),

  body('compatibilityMode')
    .optional()
    .isIn(VALID_MODES)
    .withMessage(`compatibilityMode must be one of: ${VALID_MODES.join(', ')}.`),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/api-versions/lifecycle
 */
export const lifecycleValidation = [
  body('version')
    .exists()
    .withMessage('version is required.')
    .isIn(VALID_VERSIONS)
    .withMessage(`version must be one of: ${VALID_VERSIONS.join(', ')}.`),

  body('action')
    .exists()
    .withMessage('action is required.')
    .isIn(VALID_ACTIONS)
    .withMessage(`action must be one of: ${VALID_ACTIONS.join(', ')}.`),

  body('reason')
    .optional()
    .isString()
    .trim()
    .withMessage('reason must be a string.'),

  validateRequest,
];
