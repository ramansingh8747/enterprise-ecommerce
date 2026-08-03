import { body, param, query } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';
import {
  AuditAction,
  AuditEntity,
  AuditSeverity,
  AuditStatus,
} from '../enums/audit.enums';
import { AUDIT_MAX_LIMIT } from '../constants/audit.constants';

/**
 * Audit Log Module Express-Validator Chains (Module 24.5).
 *
 * Validates query parameters, route params, export configurations, and cleanup
 * payloads before handing execution over to the controller layer.
 */

const VALID_ACTIONS = Object.values(AuditAction);
const VALID_ENTITIES = Object.values(AuditEntity);
const VALID_SEVERITIES = Object.values(AuditSeverity);
const VALID_STATUSES = Object.values(AuditStatus);

/**
 * Validation chain for GET /api/v1/audit-logs
 */
export const getAuditLogsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1.')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: AUDIT_MAX_LIMIT })
    .withMessage(`limit must be an integer between 1 and ${AUDIT_MAX_LIMIT}.`)
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

  query('action')
    .optional()
    .isIn(VALID_ACTIONS)
    .withMessage(`action must be one of: ${VALID_ACTIONS.join(', ')}.`),

  query('entity')
    .optional()
    .isIn(VALID_ENTITIES)
    .withMessage(`entity must be one of: ${VALID_ENTITIES.join(', ')}.`),

  query('severity')
    .optional()
    .isIn(VALID_SEVERITIES)
    .withMessage(`severity must be one of: ${VALID_SEVERITIES.join(', ')}.`),

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

  query('actorId')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('actorId must be a non-empty string.'),

  query('entityId')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('entityId must be a non-empty string.'),

  query('search')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('search must be a string.'),

  validateRequest,
];

/**
 * Validation chain for GET /api/v1/audit-logs/:id
 */
export const getAuditLogByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('id must be a valid MongoDB ObjectId.'),

  validateRequest,
];

/**
 * Validation chain for POST /api/v1/audit-logs/export
 */
export const exportAuditLogsValidation = [
  body('format')
    .exists()
    .withMessage('format is required.')
    .isIn(['JSON', 'CSV'])
    .withMessage('format must be either JSON or CSV.'),

  body('columns')
    .optional()
    .isArray()
    .withMessage('columns must be an array of column names.'),

  body('filename')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('filename must be a non-empty string.'),

  validateRequest,
];

/**
 * Validation chain for DELETE /api/v1/audit-logs/cleanup
 */
export const cleanupAuditLogsValidation = [
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
