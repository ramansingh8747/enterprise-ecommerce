/**
 * API Request interface for removing a variant from a user's wishlist.
 */
export interface RemoveWishlistItemRequest {
  /**
   * Unique MongoDB ObjectId string of the Product Variant to remove.
   */
  variantId: string;
}
