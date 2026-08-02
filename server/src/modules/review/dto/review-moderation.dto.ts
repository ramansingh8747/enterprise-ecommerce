/**
 * API Request interface for administrator review approval.
 */
export interface ApproveReviewRequest {
  reviewId: string;
}

/**
 * API Request interface for administrator review rejection.
 */
export interface RejectReviewRequest {
  reviewId: string;
  reason?: string;
}
