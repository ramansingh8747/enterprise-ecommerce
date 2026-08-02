import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import { wishlistController } from '../../../container';
import {
  addToWishlistValidation,
  removeFromWishlistValidation,
  moveToCartValidation,
} from '../validations/wishlist.validation';

const wishlistRouter = Router();

/**
 * GET /api/v1/wishlist
 * Endpoint to fetch authenticated user's wishlist.
 */
wishlistRouter.get('/', authenticate, (req: Request, res: Response, next: NextFunction) =>
  wishlistController.getWishlist(req, res, next)
);

/**
 * POST /api/v1/wishlist
 * Endpoint to add a variant to authenticated user's wishlist.
 */
wishlistRouter.post('/', authenticate, addToWishlistValidation, (req: Request, res: Response, next: NextFunction) =>
  wishlistController.addToWishlist(req, res, next)
);

/**
 * DELETE /api/v1/wishlist/:variantId & DELETE /api/v1/wishlist/items/:variantId
 * Endpoint to remove a product variant from authenticated user's wishlist.
 */
wishlistRouter.delete(
  '/:variantId',
  authenticate,
  removeFromWishlistValidation,
  (req: Request, res: Response, next: NextFunction) => wishlistController.removeFromWishlist(req, res, next)
);

wishlistRouter.delete(
  '/items/:variantId',
  authenticate,
  removeFromWishlistValidation,
  (req: Request, res: Response, next: NextFunction) => wishlistController.removeFromWishlist(req, res, next)
);

/**
 * POST /api/v1/wishlist/:variantId/move-to-cart & POST /api/v1/wishlist/items/:variantId/move-to-cart
 * Endpoint to transfer a wishlisted variant into the user's shopping cart.
 */
wishlistRouter.post(
  '/:variantId/move-to-cart',
  authenticate,
  moveToCartValidation,
  (req: Request, res: Response, next: NextFunction) => wishlistController.moveToCart(req, res, next)
);

wishlistRouter.post(
  '/items/:variantId/move-to-cart',
  authenticate,
  moveToCartValidation,
  (req: Request, res: Response, next: NextFunction) => wishlistController.moveToCart(req, res, next)
);

export default wishlistRouter;
