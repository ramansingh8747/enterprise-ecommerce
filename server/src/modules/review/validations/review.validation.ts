import { body, param, query } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';

/**
 * Express-validator chain for POST /api/v1/reviews (Create Review API).
 */
export const createReviewValidation = [
  body('productId')
    .notEmpty()
    .withMessage('productId is required')
    .isMongoId()
    .withMessage('productId must be a valid Mongo ObjectId'),
  body('variantId')
    .optional()
    .isMongoId()
    .withMessage('variantId must be a valid Mongo ObjectId'),
  body('orderId')
    .optional()
    .isMongoId()
    .withMessage('orderId must be a valid Mongo ObjectId'),
  body('rating')
    .notEmpty()
    .withMessage('rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('rating must be an integer between 1 and 5'),
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('title cannot exceed 150 characters'),
  body('comment')
    .notEmpty()
    .withMessage('comment is required')
    .isString()
    .trim()
    .isLength({ min: 5, max: 5000 })
    .withMessage('comment must be between 5 and 5000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('images must be an array of image URL strings'),
  validateRequest,
];

/**
 * Express-validator chain for PUT /api/v1/reviews/:reviewId (Update Review API).
 */
export const updateReviewValidation = [
  param('reviewId')
    .notEmpty()
    .withMessage('reviewId path parameter is required')
    .isMongoId()
    .withMessage('reviewId must be a valid Mongo ObjectId'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('rating must be an integer between 1 and 5'),
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('title cannot exceed 150 characters'),
  body('comment')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 5000 })
    .withMessage('comment must be between 5 and 5000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('images must be an array of image URL strings'),
  validateRequest,
];

/**
 * Express-validator chain for DELETE /api/v1/reviews/:reviewId (Delete Review API).
 */
export const deleteReviewValidation = [
  param('reviewId')
    .notEmpty()
    .withMessage('reviewId path parameter is required')
    .isMongoId()
    .withMessage('reviewId must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for PATCH /api/v1/reviews/:reviewId/approve (Approve Review API).
 */
export const approveReviewValidation = [
  param('reviewId')
    .notEmpty()
    .withMessage('reviewId path parameter is required')
    .isMongoId()
    .withMessage('reviewId must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for PATCH /api/v1/reviews/:reviewId/reject (Reject Review API).
 */
export const rejectReviewValidation = [
  param('reviewId')
    .notEmpty()
    .withMessage('reviewId path parameter is required')
    .isMongoId()
    .withMessage('reviewId must be a valid Mongo ObjectId'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('rejection reason cannot exceed 500 characters'),
  validateRequest,
];

/**
 * Express-validator chain for GET /api/v1/products/:productId/reviews (Get Product Reviews API).
 */
export const getProductReviewsValidation = [
  param('productId')
    .notEmpty()
    .withMessage('productId path parameter is required')
    .isMongoId()
    .withMessage('productId must be a valid Mongo ObjectId'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),
  validateRequest,
];
