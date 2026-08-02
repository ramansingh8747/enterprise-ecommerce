import { body, param } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';

/**
 * Express-validator chain for POST /api/v1/wishlist (Add to Wishlist API).
 */
export const addToWishlistValidation = [
  body('variantId')
    .notEmpty()
    .withMessage('variantId is required')
    .isMongoId()
    .withMessage('variantId must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for DELETE /api/v1/wishlist/:variantId (Remove from Wishlist API).
 */
export const removeFromWishlistValidation = [
  param('variantId')
    .notEmpty()
    .withMessage('variantId path parameter is required')
    .isMongoId()
    .withMessage('variantId must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for POST /api/v1/wishlist/:variantId/move-to-cart (Move to Cart API).
 */
export const moveToCartValidation = [
  param('variantId')
    .notEmpty()
    .withMessage('variantId path parameter is required')
    .isMongoId()
    .withMessage('variantId must be a valid Mongo ObjectId'),
  validateRequest,
];
