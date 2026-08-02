import { Types } from 'mongoose';

/**
 * Frequency distribution breakdown of star ratings (1 through 5).
 */
export interface IRatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

/**
 * Domain representation of pre-calculated Product Rating Summaries.
 */
export interface IProductRatingSummary {
  /**
   * Reference to the target Product ID.
   */
  productId: Types.ObjectId | string;

  /**
   * Pre-calculated average rating score (e.g. 4.65 out of 5).
   */
  averageRating: number;

  /**
   * Total count of all approved customer reviews.
   */
  totalReviews: number;

  /**
   * Rating distribution breakdown for 1, 2, 3, 4, and 5 star ratings.
   */
  distribution: IRatingDistribution;

  /**
   * UTC timestamp of the last aggregate calculation update.
   */
  updatedAt: Date;
}
