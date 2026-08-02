import { Types } from 'mongoose';

/**
 * Domain & Persistence representation of an individual item in a Wishlist.
 */
export interface IWishlistItem {
  /**
   * Reference to the specific Product Variant (SKU level).
   * Identifies the precise color/size/material selection.
   */
  variantId: Types.ObjectId | string;

  /**
   * UTC timestamp recording when the variant was added to the wishlist.
   * Enables ordering items by recency ("Recently Added").
   */
  addedAt: Date;
}
