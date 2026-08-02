import { Request, Response, NextFunction } from 'express';
import { IWishlistService } from '../interfaces/wishlist-service.interface';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { WishlistResponse } from '../dto/wishlist-response.dto';

/**
 * Enterprise Wishlist Controller (Module 17.5 & 17.6).
 * 
 * Thin HTTP adapter for Wishlist REST endpoints.
 * Responsibilities (SRP):
 * 1. Extract authenticated user identifier from req.user.
 * 2. Delegate payload processing to IWishlistService interface.
 * 3. Format and return standard ApiResponse envelope.
 * 4. Zero business logic inside controller methods.
 */
export class WishlistController {
  constructor(private readonly wishlistService: IWishlistService) {}

  /**
   * GET /api/v1/wishlist
   * Fetches the authenticated user's wishlist enriched with catalog details.
   */
  async getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const wishlist: WishlistResponse = await this.wishlistService.getWishlist(userId);

      const response: ApiResponse<WishlistResponse> = {
        success: true,
        message: 'Wishlist retrieved successfully.',
        data: wishlist,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/wishlist
   * Adds a product variant to the authenticated user's wishlist.
   */
  async addToWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const { variantId } = req.body;

      const wishlist: WishlistResponse = await this.wishlistService.addToWishlist(userId, String(variantId));

      const response: ApiResponse<WishlistResponse> = {
        success: true,
        message: 'Item added to wishlist successfully.',
        data: wishlist,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/wishlist/:variantId or DELETE /api/v1/wishlist/items/:variantId
   * Removes a product variant from the authenticated user's wishlist.
   */
  async removeFromWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const variantId = String(req.params.variantId);

      const wishlist: WishlistResponse = await this.wishlistService.removeFromWishlist(userId, variantId);

      const response: ApiResponse<WishlistResponse> = {
        success: true,
        message: 'Item removed from wishlist successfully.',
        data: wishlist,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/wishlist/:variantId/move-to-cart
   * Transfers a wishlisted variant into the user's shopping cart.
   */
  async moveToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication token missing or user unauthorized',
        });
        return;
      }

      const variantId = String(req.params.variantId);

      const result = await this.wishlistService.moveToCart(userId, variantId);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: result.message,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
