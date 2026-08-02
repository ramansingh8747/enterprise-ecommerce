/**
 * API Request interface for adding a variant to a user's wishlist.
 */
export interface AddToWishlistRequest {
  /**
   * Unique MongoDB ObjectId string of the Product Variant to add.
   */
  variantId: string;
}
