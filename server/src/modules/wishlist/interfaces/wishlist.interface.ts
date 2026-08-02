import { Types } from 'mongoose';
import { IWishlistItem } from './wishlist-item.interface';

/**
 * Domain representation of the Wishlist Aggregate Root.
 */
export interface IWishlist {
  /**
   * Unique identifier of the Wishlist document.
   */
  _id: Types.ObjectId | string;

  /**
   * Reference to the User owner of the wishlist.
   * Enforces 1:1 relationship between User and Wishlist.
   */
  userId: Types.ObjectId | string;

  /**
   * List of embedded WishlistItem value objects.
   */
  items: IWishlistItem[];

  /**
   * UTC timestamp when the wishlist aggregate was created.
   */
  createdAt: Date;

  /**
   * UTC timestamp when the wishlist aggregate was last updated.
   */
  updatedAt: Date;
}
