import { WishlistResponse } from '../dto/wishlist-response.dto';

/**
 * Result structure returned when transferring an item from Wishlist to Shopping Cart.
 */
export interface MoveToCartResult {
  success: boolean;
  message: string;
  cart?: unknown; // Shopping cart response contract placeholder
  wishlist: WishlistResponse;
}

/**
 * Enterprise Wishlist Service Contract (Clean Architecture Application Boundary).
 * Encapsulates all business rules, orchestration with Catalog/Inventory/Cart,
 * and presentation DTO conversions.
 */
export interface IWishlistService {
  /**
   * Retrieves and populates the user's wishlist with real-time catalog details, pricing, and stock.
   * @param userId Unique identifier of the requesting user
   * @returns Populated WishlistResponse model
   */
  getWishlist(userId: string): Promise<WishlistResponse>;

  /**
   * Validates variant existence and adds it to the user's wishlist, avoiding duplicates.
   * @param userId Unique identifier of the requesting user
   * @param variantId Unique identifier of the target product variant
   * @returns Populated WishlistResponse model
   */
  addToWishlist(userId: string, variantId: string): Promise<WishlistResponse>;

  /**
   * Removes a product variant from the user's wishlist.
   * @param userId Unique identifier of the requesting user
   * @param variantId Unique identifier of the target product variant
   * @returns Updated populated WishlistResponse model
   */
  removeFromWishlist(userId: string, variantId: string): Promise<WishlistResponse>;

  /**
   * Atomically transfers a wishlisted variant into the user's shopping cart
   * and removes it from the wishlist upon successful cart addition.
   * @param userId Unique identifier of the requesting user
   * @param variantId Unique identifier of the target product variant
   * @returns Result containing updated wishlist and cart details
   */
  moveToCart(userId: string, variantId: string): Promise<MoveToCartResult>;
}
