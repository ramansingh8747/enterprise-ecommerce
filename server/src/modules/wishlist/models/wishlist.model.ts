import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IWishlist } from '../interfaces/wishlist.interface';
import { IWishlistItem } from '../interfaces/wishlist-item.interface';

/**
 * Embedded Mongoose Subdocument interface for Wishlist Item.
 */
export interface IWishlistItemSubdocument {
  variantId: Types.ObjectId;
  addedAt: Date;
}

/**
 * Mongoose Document interface for Wishlist Aggregate root.
 */
export interface IWishlistDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: IWishlistItemSubdocument[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema for Wishlist Item subdocument.
 */
const WishlistItemSchema = new Schema<IWishlistItemSubdocument>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ProductVariant',
    },
    addedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    _id: false, // Prevents automatic subdocument _id generation to reduce memory footprint
  }
);

/**
 * Mongoose Schema for Wishlist Aggregate Root.
 */
export const WishlistSchema = new Schema<IWishlistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
      index: true,
    },
    items: {
      type: [WishlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'wishlists',
  }
);

/* ==========================================================================
   INDEX STRATEGY DEFINITIONS
   ========================================================================== */

// 1. Unique Owner Index: Enforces 1 wishlist per user and ensures O(1) lookups
WishlistSchema.index({ userId: 1 }, { unique: true, name: 'idx_wishlist_user_unique' });

// 2. Reverse Variant Index: Enables fast reverse lookup queries across wishlists
WishlistSchema.index({ 'items.variantId': 1 }, { name: 'idx_wishlist_items_variant' });

// 3. Compound Index: Enables optimized inclusion check (userId + variantId)
WishlistSchema.index({ userId: 1, 'items.variantId': 1 }, { name: 'idx_wishlist_user_variant' });

/**
 * Mongoose Model for Wishlist collection.
 */
export const WishlistModel: Model<IWishlistDocument> =
  mongoose.models.Wishlist || mongoose.model<IWishlistDocument>('Wishlist', WishlistSchema);

export default WishlistModel;
