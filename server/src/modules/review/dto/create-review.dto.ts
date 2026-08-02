/**
 * API Request payload interface for creating a new product review.
 */
export interface CreateReviewRequest {
  /**
   * Unique MongoDB ObjectId string of the target product.
   */
  productId: string;

  /**
   * Optional MongoDB ObjectId string of the specific product variant reviewed.
   */
  variantId?: string;

  /**
   * Optional MongoDB ObjectId string of the associated verified order.
   */
  orderId?: string;

  /**
   * Numerical star rating score (1 to 5 integer).
   */
  rating: number;

  /**
   * Optional headline title for the review.
   */
  title?: string;

  /**
   * Detailed textual review body written by the customer.
   */
  comment: string;

  /**
   * Optional array of image asset URLs.
   */
  images?: string[];
}
