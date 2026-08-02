import { Types } from 'mongoose';
import { IMerchantReply } from './merchant-reply.interface';

/**
 * Enumeration of review moderation states.
 */
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

/**
 * Domain representation of the Review Aggregate Root.
 */
export interface IReview {
  /**
   * Unique BSON identifier of the Review aggregate document.
   */
  _id: Types.ObjectId | string;

  /**
   * Reference to the User ID of the customer who authored the review.
   */
  userId: Types.ObjectId | string;

  /**
   * Reference to the target Product ID being reviewed.
   */
  productId: Types.ObjectId | string;

  /**
   * Optional reference to the specific Product Variant ID (SKU level) reviewed.
   */
  variantId?: Types.ObjectId | string;

  /**
   * Optional reference to the verified Order ID associated with the review.
   */
  orderId?: Types.ObjectId | string;

  /**
   * Numeric score assigned by the customer (Integer 1 to 5).
   */
  rating: number;

  /**
   * Optional headline summary or title for the review.
   */
  title?: string;

  /**
   * Detailed textual comment or feedback body written by the customer.
   */
  comment: string;

  /**
   * Array of media image URLs uploaded by the customer with the review.
   */
  images: string[];

  /**
   * Flag indicating if the system verified a completed purchase of the item by the user.
   */
  isVerifiedPurchase: boolean;

  /**
   * Current moderation state of the review ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED').
   */
  status: ReviewStatus;

  /**
   * Tally of positive helpful votes cast by other customers.
   */
  helpfulVotes: number;

  /**
   * Tally of negative unhelpful votes cast by other customers.
   */
  unhelpfulVotes: number;

  /**
   * Optional merchant response subdocument.
   */
  merchantReply?: IMerchantReply;

  /**
   * System UTC timestamp of initial review creation.
   */
  createdAt: Date;

  /**
   * System UTC timestamp of last review update or moderation change.
   */
  updatedAt: Date;
}
