import { IWishlist } from './wishlist.interface';

/**
 * Enterprise Wishlist Repository Contract (Dependency Inversion Principle).
 * Excludes database driver details and exposes domain-driven persistence operations only.
 */
export interface IWishlistRepository {
  /**
   * Fetches the Wishlist aggregate for a given user ID.
   * @param userId Unique identifier of the user
   * @returns Wishlist aggregate or null if not found
   */
  findByUserId(userId: string): Promise<IWishlist | null>;

  /**
   * Initializes a new empty Wishlist aggregate for a user.
   * @param userId Unique identifier of the user
   * @returns Created Wishlist aggregate
   */
  create(userId: string): Promise<IWishlist>;

  /**
   * Atomically adds a product variant to the user's wishlist if not already present ($addToSet).
   * @param userId Unique identifier of the user
   * @param variantId Unique identifier of the product variant
   * @returns Updated Wishlist aggregate or null if wishlist does not exist
   */
  addItem(userId: string, variantId: string): Promise<IWishlist | null>;

  /**
   * Atomically removes a product variant from the user's wishlist ($pull).
   * @param userId Unique identifier of the user
   * @param variantId Unique identifier of the product variant to remove
   * @returns Updated Wishlist aggregate or null if wishlist does not exist
   */
  removeItem(userId: string, variantId: string): Promise<IWishlist | null>;

  /**
   * Checks if a specific variant is present in the user's wishlist.
   * @param userId Unique identifier of the user
   * @param variantId Unique identifier of the product variant
   * @returns True if variant exists in user's wishlist, false otherwise
   */
  exists(userId: string, variantId: string): Promise<boolean>;

  /**
   * Clears all items from the user's wishlist aggregate.
   * @param userId Unique identifier of the user
   * @returns Cleared Wishlist aggregate or null if wishlist does not exist
   */
  clear(userId: string): Promise<IWishlist | null>;
}
