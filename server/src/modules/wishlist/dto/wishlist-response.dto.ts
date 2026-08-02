/**
 * API Response representation of a single wishlisted item,
 * enriched with catalog, variant, pricing, and inventory details.
 */
export interface WishlistItemResponse {
  /**
   * Reference identifier of the parent product.
   */
  productId: string;

  /**
   * Reference identifier of the wishlisted variant.
   */
  variantId: string;

  /**
   * Stock Keeping Unit code of the variant.
   */
  sku: string;

  /**
   * Display name of the parent product.
   */
  productName: string;

  /**
   * URL-friendly slug of the product.
   */
  slug: string;

  /**
   * Main thumbnail image URL of the product/variant.
   */
  thumbnail: string | null;

  /**
   * Real-time calculated selling price of the variant.
   */
  price: number;

  /**
   * Real-time strike-through original price (if on sale).
   */
  compareAtPrice: number | null;

  /**
   * Flag indicating whether real-time available stock > 0.
   */
  inStock: boolean;

  /**
   * Real-time available stock quantity.
   */
  stockQuantity: number;

  /**
   * Variant attributes key-value map (e.g. { Color: "Red", Size: "XL" }).
   */
  attributes: Record<string, string>;

  /**
   * UTC timestamp when the item was added to the wishlist.
   */
  addedAt: Date;
}

/**
 * Enterprise API Response representation of a user's Wishlist aggregate.
 */
export interface WishlistResponse {
  /**
   * Unique identifier of the wishlist.
   */
  _id: string;

  /**
   * Unique identifier of the user owner.
   */
  userId: string;

  /**
   * List of populated, enriched wishlist items.
   */
  items: WishlistItemResponse[];

  /**
   * Total count of active items in the wishlist.
   */
  totalItems: number;

  /**
   * ISO/Date timestamp of creation.
   */
  createdAt: Date;

  /**
   * ISO/Date timestamp of last modification.
   */
  updatedAt: Date;
}
