import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IReview, ReviewStatus } from '../interfaces/review.interface';
import { IMerchantReply } from '../interfaces/merchant-reply.interface';

/**
 * Mongoose Subdocument interface for Merchant Reply.
 */
export interface IMerchantReplySubdocument {
  comment: string;
  repliedAt: Date;
  repliedBy: Types.ObjectId;
}

/**
 * Mongoose Document interface for Review Aggregate.
 */
export interface IReviewDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  helpfulVotes: number;
  unhelpfulVotes: number;
  merchantReply?: IMerchantReplySubdocument;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema for Merchant Reply subdocument.
 */
const MerchantReplySchema = new Schema<IMerchantReplySubdocument>(
  {
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    repliedAt: { type: Date, required: true, default: Date.now },
    repliedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { _id: false }
);

/**
 * Mongoose Schema for Review Aggregate Root.
 */
export const ReviewSchema = new Schema<IReviewDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
      index: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedPurchase: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'],
      default: 'PENDING',
      index: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    unhelpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    merchantReply: {
      type: MerchantReplySchema,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'reviews',
  }
);

/* ==========================================================================
   INDEX STRATEGY DEFINITIONS
   ========================================================================== */

// 1. Unique User-Product Invariant Index: Prevents multiple reviews by a single user per product
ReviewSchema.index(
  { userId: 1, productId: 1 },
  { unique: true, name: 'idx_review_user_product_unique' }
);

// 2. Product Approved Reviews Listing Index: Powers paginated catalog page review listings
ReviewSchema.index(
  { productId: 1, status: 1, createdAt: -1 },
  { name: 'idx_review_product_status_created' }
);

// 3. Admin Moderation Queue Index: Powers admin moderation queries for pending reviews
ReviewSchema.index(
  { status: 1, createdAt: 1 },
  { name: 'idx_review_status_created' }
);

// 4. Order Lookup Index: Powers verified purchase checks against specific orders
ReviewSchema.index(
  { orderId: 1, productId: 1 },
  { name: 'idx_review_order_product' }
);

/**
 * Mongoose Model for Review collection.
 */
export const ReviewModel: Model<IReviewDocument> =
  mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema);

export default ReviewModel;
