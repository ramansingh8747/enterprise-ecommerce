import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IProductRatingSummary, IRatingDistribution } from '../interfaces/rating-summary.interface';

/**
 * Mongoose Document interface for Product Rating Summary.
 */
export interface IProductRatingSummaryDocument extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  averageRating: number;
  totalReviews: number;
  distribution: IRatingDistribution;
  updatedAt: Date;
}

/**
 * Mongoose Schema for Product Rating Summary.
 */
export const ProductRatingSummarySchema = new Schema<IProductRatingSummaryDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'Product',
      index: true,
    },
    averageRating: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    distribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'product_rating_summaries',
  }
);

/**
 * Unique Index on productId for fast O(1) summary lookups
 */
ProductRatingSummarySchema.index(
  { productId: 1 },
  { unique: true, name: 'idx_rating_summary_product_unique' }
);

/**
 * Mongoose Model for Product Rating Summary collection.
 */
export const ProductRatingSummaryModel: Model<IProductRatingSummaryDocument> =
  mongoose.models.ProductRatingSummary ||
  mongoose.model<IProductRatingSummaryDocument>('ProductRatingSummary', ProductRatingSummarySchema);

export default ProductRatingSummaryModel;
