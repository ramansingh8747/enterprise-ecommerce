import { query, ValidationChain } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';
import { MAX_LIMIT } from '../constants/search.constants';
import { SortField, SortDirection, StockStatus, AvailabilityStatus } from '../types/search.types';

/**
 * Enterprise Search Request Validator (Module 22.5).
 *
 * Express-validator chains for GET /api/v1/search query parameters.
 * Request-shape validation only (SRP).
 * No database access, business rules, or HTTP response handling.
 */

const KEYWORD_MAX_LENGTH = 200;

const SORT_FIELDS: SortField[] = [
  'price',
  'createdAt',
  'updatedAt',
  'rating',
  'popularity',
  'name',
];

const SORT_ORDERS: SortDirection[] = ['ASC', 'DESC'];

const STOCK_STATUSES: string[] = Object.values(StockStatus);
const AVAILABILITY_STATUSES: string[] = Object.values(AvailabilityStatus);

/**
 * Validation chain array for the Search Products endpoint.
 *
 * Each chain validates a single query parameter following enterprise
 * standards: trim, cast, range-check, enum-guard, and structured-object
 * rejection before reaching the controller.
 */
export const searchProductsValidation: (ValidationChain | typeof validateRequest)[] = [
  // ------------------------------------------------------------------ keyword
  query('keyword')
    .optional()
    .isString()
    .withMessage('keyword must be a string.')
    .trim()
    .notEmpty()
    .withMessage('keyword must not be empty after trimming.')
    .isLength({ max: KEYWORD_MAX_LENGTH })
    .withMessage(`keyword must not exceed ${KEYWORD_MAX_LENGTH} characters.`),

  // ------------------------------------------------------------------ page
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1.')
    .toInt(),

  // ------------------------------------------------------------------ limit
  query('limit')
    .optional()
    .isInt({ min: 1, max: MAX_LIMIT })
    .withMessage(`limit must be an integer between 1 and ${MAX_LIMIT}.`)
    .toInt(),

  // ------------------------------------------------------------------ sortBy
  query('sortBy')
    .optional()
    .isString()
    .withMessage('sortBy must be a string.')
    .trim()
    .isIn(SORT_FIELDS)
    .withMessage(`sortBy must be one of: ${SORT_FIELDS.join(', ')}.`),

  // ------------------------------------------------------------------ sortOrder
  query('sortOrder')
    .optional()
    .isString()
    .withMessage('sortOrder must be a string.')
    .trim()
    .toUpperCase()
    .isIn(SORT_ORDERS)
    .withMessage(`sortOrder must be one of: ${SORT_ORDERS.join(', ')}.`),

  // ------------------------------------------------------------------ category
  query('category')
    .optional()
    .custom((value: unknown) => {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item !== 'string' || item.trim().length === 0) {
            throw new Error('Each category value must be a non-empty string.');
          }
        }
        return true;
      }
      if (typeof value === 'string' && value.trim().length > 0) {
        return true;
      }
      throw new Error('category must be a non-empty string or array of non-empty strings.');
    }),

  // ------------------------------------------------------------------ brand
  query('brand')
    .optional()
    .custom((value: unknown) => {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item !== 'string' || item.trim().length === 0) {
            throw new Error('Each brand value must be a non-empty string.');
          }
        }
        return true;
      }
      if (typeof value === 'string' && value.trim().length > 0) {
        return true;
      }
      throw new Error('brand must be a non-empty string or array of non-empty strings.');
    }),

  // ------------------------------------------------------------------ minPrice
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a number greater than or equal to 0.')
    .toFloat(),

  // ------------------------------------------------------------------ maxPrice
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a number greater than or equal to 0.')
    .toFloat(),

  // ------------------------------------------------------------------ price range cross-field guard
  query('maxPrice')
    .optional()
    .custom((_value: unknown, { req }) => {
      const min = req.query?.minPrice;
      const max = req.query?.maxPrice;
      if (min !== undefined && max !== undefined) {
        const minNum = parseFloat(String(min));
        const maxNum = parseFloat(String(max));
        if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
          throw new Error('minPrice must be less than or equal to maxPrice.');
        }
      }
      return true;
    }),

  // ------------------------------------------------------------------ rating
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('rating must be a numeric value between 0 and 5.')
    .toFloat(),

  // ------------------------------------------------------------------ availability
  query('availability')
    .optional()
    .custom((value: unknown) => {
      if (typeof value !== 'string') {
        throw new Error('availability must be a string.');
      }
      const lower = value.trim().toLowerCase();
      // Accept boolean-string shorthand
      if (lower === 'true' || lower === 'false') {
        return true;
      }
      // Accept explicit enum values
      const upper = value.trim().toUpperCase();
      if (AVAILABILITY_STATUSES.includes(upper)) {
        return true;
      }
      throw new Error(
        `availability must be a boolean ("true"/"false") or one of: ${AVAILABILITY_STATUSES.join(', ')}.`
      );
    }),

  // ------------------------------------------------------------------ stockStatus
  query('stockStatus')
    .optional()
    .isString()
    .withMessage('stockStatus must be a string.')
    .trim()
    .toUpperCase()
    .isIn(STOCK_STATUSES)
    .withMessage(`stockStatus must be one of: ${STOCK_STATUSES.join(', ')}.`),

  // ------------------------------------------------------------------ tags
  query('tags')
    .optional()
    .custom((value: unknown) => {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item !== 'string' || item.trim().length === 0) {
            throw new Error('Each tag must be a non-empty string.');
          }
        }
        return true;
      }
      if (typeof value === 'string' && value.trim().length > 0) {
        return true;
      }
      throw new Error('tags must be a non-empty string or array of non-empty strings.');
    }),

  // ------------------------------------------------------------------ attributes
  query('attributes')
    .optional()
    .custom((value: unknown) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error(
          'attributes must be a plain object (e.g., attributes[color]=red).'
        );
      }
      const attrMap = value as Record<string, unknown>;
      for (const [attrKey, attrVal] of Object.entries(attrMap)) {
        if (typeof attrKey !== 'string' || attrKey.trim().length === 0) {
          throw new Error('Each attribute key must be a non-empty string.');
        }
        if (Array.isArray(attrVal)) {
          for (const item of attrVal) {
            if (typeof item !== 'string' || (item as string).trim().length === 0) {
              throw new Error(
                `Attribute "${attrKey}" contains an invalid value. Each value must be a non-empty string.`
              );
            }
          }
        } else if (typeof attrVal !== 'string' || (attrVal as string).trim().length === 0) {
          throw new Error(
            `Attribute "${attrKey}" must be a non-empty string or array of non-empty strings.`
          );
        }
      }
      return true;
    }),

  // ------------------------------------------------------------------ result gate
  validateRequest,
];
