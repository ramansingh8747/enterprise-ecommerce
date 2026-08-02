/**
 * API Request payload interface for editing an existing product review.
 */
export interface UpdateReviewRequest {
  /**
   * Updated star rating score (1 to 5).
   */
  rating?: number;

  /**
   * Updated headline title.
   */
  title?: string;

  /**
   * Updated textual comment.
   */
  comment?: string;

  /**
   * Updated list of image asset URLs.
   */
  images?: string[];
}
