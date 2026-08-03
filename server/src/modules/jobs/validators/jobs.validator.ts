import { body, param, query } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';
import { JobPriority, JobStatus, JobTrigger, JobType } from '../enums/jobs.enums';
import { JOBS_MAX_LIMIT } from '../constants/jobs.constants';

/**
 * Background Jobs Module Express-Validator Chains (Module 25.5).
 *
 * Validates request payload structure, parameter IDs, query filters, retry options,
 * and cleanup options before handing execution over to the controller.
 */

const VALID_TYPES = Object.values(JobType);
const VALID_STATUSES = Object.values(JobStatus);
const VALID_PRIORITIES = Object.values(JobPriority);
const VALID_TRIGGERS = Object.values(JobTrigger);

/**
 * Validation chain for POST /api/v1/jobs (Create Job)
 */
export const createJobValidation = [
  body('type')
    .exists()
    .withMessage('type is required.')
    .isIn(VALID_TYPES)
    .withMessage(`type must be one of: ${VALID_TYPES.join(', ')}.`),

  body('payload')
    .exists()
    .withMessage('payload object is required.')
    .isObject()
    .withMessage('payload must be a valid key-value JSON object.'),

  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`priority must be one of: ${VALID_PRIORITIES.join(', ')}.`),

  body('trigger')
    .optional()
    .isIn(VALID_TRIGGERS)
    .withMessage(`trigger must be one of: ${VALID_TRIGGERS.join(', ')}.`),

  body('name')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('name must be a non-empty string when provided.'),

  validateRequest,
];

/**
 * Validation chain for GET /api/v1/jobs (List Jobs)
 */
export const getJobsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1.')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: JOBS_MAX_LIMIT })
    .withMessage(`limit must be an integer between 1 and ${JOBS_MAX_LIMIT}.`)
    .toInt(),

  query('sortBy')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('sortBy must be a non-empty string.'),

  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('sortOrder must be either ASC or DESC.'),

  query('type')
    .optional()
    .isIn(VALID_TYPES)
    .withMessage(`type must be one of: ${VALID_TYPES.join(', ')}.`),

  query('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}.`),

  query('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`priority must be one of: ${VALID_PRIORITIES.join(', ')}.`),

  query('trigger')
    .optional()
    .isIn(VALID_TRIGGERS)
    .withMessage(`trigger must be one of: ${VALID_TRIGGERS.join(', ')}.`),

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
 * Validation chain for ID route parameters: GET /api/v1/jobs/:id, POST /api/v1/jobs/:id/retry, POST /api/v1/jobs/:id/cancel
 */
export const jobIdParamValidation = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('id parameter is required.'),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/jobs/:id/retry
 */
export const retryJobValidation = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('id parameter is required.'),

  body('forceRetry')
    .optional()
    .isBoolean()
    .withMessage('forceRetry must be a boolean value.')
    .toBoolean(),

  body('reason')
    .optional()
    .isString()
    .trim()
    .withMessage('reason must be a string.'),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/jobs/:id/cancel
 */
export const cancelJobValidation = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('id parameter is required.'),

  body('reason')
    .optional()
    .isString()
    .trim()
    .withMessage('reason must be a string.'),

  validateRequest,
];

/**
 * Validation chain for DELETE /api/v1/jobs/cleanup
 */
export const cleanupJobsValidation = [
  body('retentionDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('retentionDays must be a positive integer.')
    .toInt(),

  body('olderThan')
    .optional()
    .isISO8601()
    .withMessage('olderThan must be a valid ISO 8601 timestamp string.'),

  body('dryRun')
    .optional()
    .isBoolean()
    .withMessage('dryRun must be a boolean value.')
    .toBoolean(),

  validateRequest,
];
